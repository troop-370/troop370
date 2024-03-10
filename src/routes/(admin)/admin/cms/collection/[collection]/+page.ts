import { browser } from '$app/environment';
import { isJSON } from '$utils/isJSON';
import { queryWithStore } from '$utils/query';
import { get } from 'svelte/store';
import { z } from 'zod';
import type { PageLoad } from './$types';

export const load = (async ({ fetch, parent, params, url, depends }) => {
  depends('collection-table');

  const { session, collectionConfig } = await parent();

  const sort = (() => {
    // prefer to use the sort defined in localstorage
    const localStorageSortStr: string | null = browser
      ? localStorage.getItem(`table.${params.collection}.sort`)
      : null;
    const localStorageSort: Record<string, 1 | -1> = JSON.parse(localStorageSortStr || '{}');

    const sort: Record<string, 1 | -1> = { ...localStorageSort };

    // if sort is empty, use the default sort key and order because an empty sort object is invalid
    if (Object.keys(sort).length === 0) {
      const defaultSortKey =
        url.searchParams.get('__defaultSortKey') ||
        get(collectionConfig)?.contentType.settings.defaultSortBy ||
        'createdAt';
      const defaultSortKeyOrder = (() => {
        const __defaultSortKeyOrder = url.searchParams.get('__defaultSortKeyOrder');
        if (__defaultSortKeyOrder) return __defaultSortKeyOrder === '1' ? 1 : -1;
        return get(collectionConfig)?.contentType.settings.defaultSortOrder.toLowerCase() === 'asc'
          ? 1
          : -1;
      })();
      sort[defaultSortKey] = defaultSortKeyOrder;
    }

    return sort;
  })();

  const collectionDocsData = queryWithStore<CollectionDocs>({
    fetch,
    query: {
      location: '/admin/strapi/content-manager/collection-types/' + params.collection,
      opName: `collectionTableData${params.collection}`,
    },
    variables: {
      page: 1,
      pageSize: 35,
      sort: Object.fromEntries(
        Object.entries(sort).map(([key, value]) => [key, value === -1 ? 'desc' : 'asc'])
      ),
      _q: url.searchParams.get('_search'),
      filters: paramsToFilter(url.searchParams),
    },
    Authorization: `Bearer ${session.adminToken}`,
    validator: collectionDocsSchema,
  });

  return {
    collectionDocsData: await collectionDocsData,
    table: {
      sort,
      filters: paramsToFilter(url.searchParams),
    },
    url,
  };
}) satisfies PageLoad;

type CollectionDocs = z.infer<typeof collectionDocsSchema>;
const collectionDocsSchema = z
  .object({
    id: z.number(),
  })
  .passthrough()
  .array();

function paramsToFilter(search: URLSearchParams) {
  const result: Record<string, string> = {};
  for (const [key, value] of search.entries()) {
    // each 'entry' is a [key, value] tuple
    if (!key.startsWith('__')) {
      if (value.startsWith('"') && value.endsWith('"')) result[key] = value.slice(1, -1);
      else if (isJSON(value)) result[key] = JSON.parse(value);
      else result[key] = value;
    }
  }
  return result;
}
