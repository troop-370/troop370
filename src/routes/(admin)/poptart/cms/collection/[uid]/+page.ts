import { browser } from '$app/environment';
import { isJSON } from '$utils/isJSON';
import { queryWithStore } from '$utils/query';
import { error } from '@sveltejs/kit';
import { derived, get } from 'svelte/store';
import { z } from 'zod';
import type { PageLoad } from './$types';

export const load = (async ({ fetch, parent, params, url, depends }) => {
  depends('collection-table');

  const { session, contentManagerSettings, userPermissions } = await parent();
  if (!contentManagerSettings) error(404, 'failed to find content manager settings');

  const settings = get(contentManagerSettings)?.data?.docs?.contentTypes.find(
    (type) => type.uid === params.uid
  );
  if (!settings) error(404, 'failed to find content type settings');

  if (!userPermissions) error(404, 'failed to find user permissions');
  const permissions = get(userPermissions)?.raw.filter((p) => p.subject === params.uid);
  if (!settings) error(404, 'failed to find content type permissions');

  const collectionConfig = await queryWithStore<z.infer<typeof collectionConfigurationSchema>>({
    fetch,
    query: {
      location: '/strapi/content-manager/content-types/' + params.uid + '/configuration',
      opName: `strapiContentTypeConfig_${params.uid}`,
      docsPath: 'data',
      paginationPath: '',
    },
    validator: collectionConfigurationSchema,
    Authorization: `Bearer ${session.adminToken}`,
    waitForQuery: true, // ensure that data is available before continuing since we need it in this function
    useCache: true,
    expireCache: 15 * 60 * 1000, // require refetch if it has been 15 minutes
  }).then((store) => {
    return derived([store], ([$store]) => {
      return $store.data?.docs;
    });
  });

  const sort = (() => {
    // prefer to use the sort defined in localstorage
    const localStorageSortStr: string | null = browser
      ? localStorage.getItem(`table.${params.uid}.sort`)
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
      location: '/strapi/content-manager/collection-types/' + params.uid,
      opName: `collectionTableData${params.uid}`,
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
    settings,
    permissions,
    collectionConfig,
    collectionDocsData: await collectionDocsData,
    table: {
      sort,
      filters: paramsToFilter(url.searchParams),
    },
    url,
  };
}) satisfies PageLoad;

const collectionConfigurationSchema = z.object({
  contentType: z.object({
    layouts: z.object({
      edit: z
        .object({
          name: z.string(),
          size: z.number(),
        })
        .array()
        .array(),
      list: z.string().array(),
    }),
    metadatas: z.record(
      z.string(),
      z.object({
        edit: z.object({
          description: z.string().optional(),
          editable: z.boolean().optional(),
          label: z.string().optional(),
          placeholder: z.string().optional(),
          visible: z.boolean().optional(),
        }),
        list: z.object({
          label: z.string(),
          searchable: z.boolean(),
          sortable: z.boolean(),
        }),
      })
    ),
    settings: z.object({
      bulkable: z.boolean(),
      defaultSortBy: z.string(),
      defaultSortOrder: z.string(),
      filterable: z.boolean(),
      mainField: z.string(),
      pageSize: z.number(),
      searchable: z.boolean(),
    }),
  }),
});

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
