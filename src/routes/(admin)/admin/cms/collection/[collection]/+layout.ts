import { queryWithStore } from '$utils/query';
import { error } from '@sveltejs/kit';
import { derived, get } from 'svelte/store';
import { z } from 'zod';
import type { LayoutLoad } from './$types';

export const load = (async ({ fetch, parent, params }) => {
  const { session, contentManagerSettings, userPermissions } = await parent();
  if (!contentManagerSettings) throw error(404, 'failed to find content manager settings');

  const settings = get(contentManagerSettings)?.data?.docs?.contentTypes.find(
    (type) => type.uid === params.collection
  );
  if (!settings) throw error(404, 'failed to find content type settings');

  if (!userPermissions) throw error(404, 'failed to find user permissions');
  const permissions = get(userPermissions)?.raw.filter((p) => p.subject === params.collection);
  if (!settings) throw error(404, 'failed to find content type permissions');

  const collectionConfig = await queryWithStore<z.infer<typeof collectionConfigurationSchema>>({
    fetch,
    query: {
      location:
        '/admin/strapi/content-manager/content-types/' + params.collection + '/configuration',
      opName: `strapiContentTypeConfig_${params.collection}`,
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

  return {
    settings,
    permissions,
    collectionConfig,
  };
}) satisfies LayoutLoad;

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
