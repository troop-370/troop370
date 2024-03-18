import { queryWithStore } from '$utils/query';
import { overrideItemIdKeyNameBeforeInitialisingDndZones } from 'svelte-dnd-action';
import { derived } from 'svelte/store';
import { z } from 'zod';
import type { LayoutLoad } from './$types';

overrideItemIdKeyNameBeforeInitialisingDndZones('_id');

export const load = (async ({ fetch, parent }) => {
  const { session } = await parent();

  const previewConfig = await queryWithStore<z.infer<typeof collectionPreviewConfigSchema>[]>({
    fetch,
    query: {
      location: '/admin/strapi/preview-button/config',
      opName: `strapiCollectionPreviewConfig`,
      docsPath: 'config.contentTypes',
      paginationPath: '',
    },
    validator: collectionPreviewConfigSchema.array(),
    Authorization: `Bearer ${session.adminToken}`,
    waitForQuery: true, // ensure that data is available before continuing since we need it in this function
    useCache: true,
    expireCache: 15 * 60 * 1000, // require refetch if it has been 15 minutes
  }).then((store) => {
    return derived([store], ([$store]) => {
      return $store.data?.docs;
    });
  });

  return { previewConfig };
}) satisfies LayoutLoad;

const collectionPreviewConfigSchema = z.object({
  uid: z.string(),
  published: z
    .object({
      url: z.string(),
      query: z.record(z.string(), z.string()).optional(),
    })
    .optional(),
  draft: z
    .object({
      url: z.string(),
      query: z.record(z.string(), z.string()).optional(),
    })
    .optional(),
});
