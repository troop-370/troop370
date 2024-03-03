import { browser } from '$app/environment';
import { flattenObject } from 'flatten-anything';
import qs from 'qs';
import type { Readable } from 'svelte/store';
import { derived, get, readable, writable } from 'svelte/store';
import type { z } from 'zod';
import { getProperty } from './objectPath';

export interface GraphqlQueryOptions<VariablesType = {}> {
  fetch: typeof fetch;
  /**
   * AbosrtSignal provided to `fetch`
   */
  signal?: AbortSignal;
  query: Query;
  variables?: VariablesType;
  useCache?: boolean;
  /**
   * Millseconds until the cache is considered outdated.
   * If it is not invalid, a persisted copy from localStorage will be used.
   */
  persistCache?: number;
  /**
   * Millseconds until the cache is considered outdated.
   */
  expireCache?: number;
  fetchNextPages?: boolean;
  skip?: boolean;
  _varKey?: string;
  /**
   * Whether the store value should be reset to undefined.
   *
   * Default: `false`
   */
  clearStoreBeforeFetch?: boolean;
  Authorization?: string;
  validator?: z.Schema;
  /**
   * Default: `'include'`
   */
  credentials?: RequestCredentials;
}

interface Query {
  location: string;
  opName: string;
  docsPath?: string;
  paginationPath?: string;
}

// cache store
const localStorePersistCopy = (browser && localStorage.getItem('store:graphql:cache')) || '{}';
const cache = writable<
  Record<
    string,
    Record<
      string,
      {
        time: number;
        value: ReturnType<Paged<unknown>>;
        persist: boolean;
        queryOpts: Omit<GraphqlQueryOptions<unknown>, 'fetch'>;
      }
    >
  >
>(JSON.parse(localStorePersistCopy));
cache.subscribe((value) => {
  // persist to localStorage only if persist is true
  if (browser) {
    const persistable = Object.fromEntries(
      Object.entries(value).map(([k, v]) => {
        return [k, Object.fromEntries(Object.entries(v).filter(([key, value]) => value.persist))];
      })
    );
    localStorage.setItem('store:graphql:cache', JSON.stringify(persistable));
  }
});

// track loading
const loading = writable<Record<string, Record<string, boolean>>>({});

function getOperationInfo(query: Query) {
  return {
    operationName: query.opName,
    topSelectionName: query.docsPath ?? 'results',
    paginationName: query.paginationPath ?? 'pagination',
  };
}

export async function query<DataType = unknown, VariablesType = unknown>({
  fetch: _fetch,
  ...opts
}: GraphqlQueryOptions<VariablesType>): Promise<GraphqlQueryReturn<Paged<DataType>>> {
  const fetch = _fetch;
  if (opts.skip) return {};

  const { operationName, topSelectionName, paginationName } = getOperationInfo(opts.query);
  const varKey = opts._varKey || createVariableKey(opts.variables || {});

  if (operationName && opts.useCache && get(cache)[operationName]?.[varKey]) {
    if (opts.persistCache || opts.expireCache) {
      const { time, value } = get(cache)[operationName][varKey];
      if (new Date(time + (opts.expireCache || opts.persistCache || 0)) > new Date()) {
        // cache data is not yet expired
        return value as ReturnType<Paged<DataType>>;
      }
    } else {
      return get(cache)[operationName][varKey].value as ReturnType<Paged<DataType>>;
    }
  }

  // set the loading is occuring
  if (operationName) {
    loading.update((state) => ({
      ...state,
      [operationName]: {
        ...(state[operationName] || {}),
        [varKey]: true,
      },
    }));
  }

  return fetch(opts.query.location + '?' + qs.stringify(opts.variables || {}), {
    method: 'GET',
    signal: opts.signal,
    credentials: opts.credentials ?? 'include',
    headers: { 'Content-Type': 'application/json', Authorization: opts.Authorization || '' },
  })
    .then(async (res) => {
      if (res.ok) {
        const _json = await res.json();

        // if a validator is provided, try to make sure it matches
        let errors: any[] = [];
        let data: any = [];
        if (opts.validator) {
          const result = opts.validator.safeParse(getProperty(_json, topSelectionName));
          if (result.success) {
            const page = getProperty(_json, paginationName)?.page;
            const totalPages = getProperty(_json, paginationName)?.pageCount;
            data = {
              docs: result.data,
              totalDocs: getProperty(_json, paginationName)?.total,
              page,
              totalPages,
              pagingCounter: undefined,
              hasPrevPage: page > 1,
              hasNextPage: page < totalPages,
              prevPage: page > 1 ? page - 1 : undefined,
              nextPage: page < totalPages ? page + 1 : undefined,
              pageSize: getProperty(_json, paginationName)?.pageSize,
              offset: getProperty(_json, paginationName)?.offset,
            };
          } else {
            errors = result.error.errors;
          }
        }

        const json = { data, errors, loading: false } as ReturnType<Paged<DataType>>;

        // attempt to retrieve the docs from every page (this could take a while)
        // and combine into the main docs array
        const page: number = (opts?.variables as any)?.page || 1;
        if (opts?.fetchNextPages && json.data && (json.data as any)?.docs?.length > 0) {
          const next = await query<DataType>({
            fetch,
            ...opts,
            variables: { ...opts.variables, page: page + 1 },
          });
          const nextDocs = getProperty((next?.data as any)?.docs || {}, topSelectionName);
          getProperty(json.data, topSelectionName).push(...nextDocs);
        }

        return json;
      }
      throw res;
    })
    .catch(async (res) => {
      try {
        const _json = await res.json();

        return {
          data: {
            docs: null as unknown,
            totalDocs: 0,
            page: 0,
            totalPages: 0,
            pagingCounter: 0,
            hasPrevPage: false,
            hasNextPage: false,
            prevPage: 0,
            nextPage: 0,
            pageSize: 0,
            offset: 0,
          },
          errors: [_json.error],
          loading: false,
        } as ReturnType<Paged<DataType>>;
      } catch (err) {
        return null;
      }
    })
    .then((json) => {
      // cache the result so it can be used immediately (cache is lost on page refresh)
      if (operationName) {
        cache.update((state) => ({
          ...state,
          [operationName]: {
            ...state[operationName],
            [varKey]: {
              time: new Date().getTime(),
              value: json as Record<string, unknown>,
              use: opts.useCache,
              persist: !!opts.persistCache,
              queryOpts: opts,
            },
          },
        }));
        loading.update((state) => ({
          ...state,
          [operationName]: {
            ...(state[operationName] || {}),
            [varKey]: false,
          },
        }));
      }

      return json;
    });
}

export function getQueryStore<DataType = unknown, VariablesType = unknown>(opts: {
  queryName: string;
  variables?: VariablesType;
}): Readable<StoreReturnType<Paged<DataType>, VariablesType>> {
  const varKey = createVariableKey(opts.variables || {});

  return derived([cache, loading], ([$cache, $loading]) => {
    return {
      data: $cache[opts.queryName]?.[varKey]?.value.data,
      errors: $cache[opts.queryName]?.[varKey]?.value.errors,
      loading: $loading[opts.queryName]?.[varKey] || false,
      refetch: async (updatedVariables) => {
        if (!$cache[opts.queryName]) return;
        if (!$cache[opts.queryName][varKey]) return;

        const queryOpts = $cache[opts.queryName]?.[varKey].queryOpts;
        await query({
          fetch,
          ...queryOpts,
          variables: {
            ...(queryOpts.variables || {}),
            ...(updatedVariables || {}),
          },
          expireCache: 1,

          // make sure that the varKey remains the same even though the variables changed
          _varKey: varKey,
        });
      },
      fetchNextPage: async (currentPage: number = (opts?.variables as any)?.page || 1) => {
        if (!$cache[opts.queryName]) return;
        if (!$cache[opts.queryName][varKey]) return;

        const queryOpts = $cache[opts.queryName][varKey].queryOpts;

        const next = await query<DataType>({
          fetch,
          ...queryOpts,
          variables: { ...(queryOpts.variables || {}), page: currentPage + 1 },
        });

        return {
          current: $cache[opts.queryName][varKey].value.data as Paged<DataType>,
          next: next?.data,
          setStore: (merged) => {
            setUpdatedData(queryOpts, varKey, merged);
            return merged;
          },
        };
      },
      fetchMore: async (offset: number, limit = 10) => {
        if (!$cache[opts.queryName]) return;
        if (!$cache[opts.queryName][varKey]) return;

        const queryOpts = $cache[opts.queryName][varKey].queryOpts;

        const next = await query<DataType>({
          fetch,
          ...queryOpts,
          variables: { ...(queryOpts.variables || {}), offset, limit },
        });

        return {
          current: $cache[opts.queryName][varKey].value.data as Paged<DataType>,
          next: next?.data,
          setStore: (merged) => {
            setUpdatedData(queryOpts, varKey, merged);
            return merged;
          },
        };
      },
    } as StoreReturnType<Paged<DataType>, VariablesType>;
  });
}

function setUpdatedData<DataType = unknown>(
  queryOpts: Omit<GraphqlQueryOptions<unknown>, 'fetch'>,
  varKey: string,
  merged: Paged<DataType>
) {
  const { operationName } = getOperationInfo(queryOpts.query);

  if (operationName) {
    cache.update((state) => ({
      ...state,
      [operationName]: {
        ...state[operationName],
        [varKey]: {
          ...state[operationName][varKey],
          time: new Date().getTime(),
          value: {
            ...state[operationName][varKey].value,
            data: merged,
          },
        },
      },
    }));
  }
}

function clearStoreData<VariablesType = unknown>(
  queryOpts: Omit<GraphqlQueryOptions<VariablesType>, 'fetch'>
) {
  const { operationName } = getOperationInfo(queryOpts.query);
  const varKey = queryOpts._varKey || createVariableKey(queryOpts.variables || {});

  if (operationName) {
    cache.update((state) => {
      if (
        state[operationName] &&
        typeof state[operationName] === 'object' &&
        state[operationName][varKey]
      ) {
        delete state[operationName][varKey];
      }
      return state;
    });
  }
}

export async function queryWithStore<DataType = unknown, VariablesType = unknown>(
  opts: GraphqlQueryOptions<VariablesType> & { waitForQuery?: boolean }
): Promise<Readable<StoreReturnType<Paged<DataType>, VariablesType>>> {
  await new Promise<void>(async (resolve) => {
    if (opts.clearStoreBeforeFetch) clearStoreData(opts);

    if (opts.waitForQuery) await query(opts);
    else query(opts);

    resolve();
  });

  const { operationName } = getOperationInfo(opts.query);
  if (!operationName)
    return readable({
      refetch: async () => {},
      fetchNextPage: async () => {
        return {
          setStore: (merged) => {
            return merged;
          },
        };
      },
      fetchMore: async () => {
        return {
          setStore: (merged) => {
            return merged;
          },
        };
      },
    });

  return getQueryStore<DataType, VariablesType>({
    queryName: operationName,
    variables: opts.variables,
  });
}

/**
 * Flattens, alphabetically sorts, and stringifies the variables object.
 *
 * This is useful for creating predictable indentifiers for different sets
 * of variables.
 */
function createVariableKey(variables: Record<string, unknown>) {
  const flat = flattenObject(variables);
  const sorted = Object.fromEntries(Object.entries(flat).sort((a, b) => a[0].localeCompare(b[0])));
  return JSON.stringify(sorted);
}

export { cache as queryCacheStore };
export type GraphqlQueryReturn<DataType> = ReturnType<DataType> | null;

interface ReturnType<DataType> {
  data?: DataType;
  errors?: any;
  loading?: boolean;
}

export interface StoreReturnType<DataType, VariablesType> extends ReturnType<DataType> {
  refetch: (updatedVariables?: Partial<VariablesType>) => Promise<void>;
  fetchNextPage: (currentPage?: number) => Promise<{
    current?: Paged<DataType>;
    next?: Paged<DataType>;
    setStore: (merged: Paged<DataType>) => Paged<DataType>;
  }>;
  fetchMore: (
    offset: number,
    limit?: number
  ) => Promise<{
    current?: Paged<DataType>;
    next?: Paged<DataType>;
    setStore: (merged: Paged<DataType>) => Paged<DataType>;
  }>;
}

export interface Paged<T> {
  docs: T;
  totalDocs: number;
  page: number;
  totalPages: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number;
  nextPage: number;
}
