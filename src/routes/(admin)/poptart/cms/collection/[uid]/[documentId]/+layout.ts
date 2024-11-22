import { get, writable } from 'svelte/store';
import { z } from 'zod';
import type { LayoutLoad } from './$types';

export const load = (async ({ parent, params, fetch, depends }) => {
  depends('document:versions');
  const { session } = await parent();

  const versions = writable<{
    data: z.infer<typeof versionsDataSchema> | null;
    loading: boolean;
    refetchOnInvalidate: boolean;
  }>({
    data: null,
    loading: false,
    refetchOnInvalidate: false,
  });

  if (!get(versions).data || get(versions).refetchOnInvalidate) {
    versions.set({ data: null, loading: true, refetchOnInvalidate: false });
    fetch(
      `/strapi/content-manager/history-versions?contentType=${params.uid}&documentId=${params.documentId}&pageSize=100`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.adminToken}`,
        },
      }
    )
      .then((res) => res.json())
      .then((json) => versionsDataSchema.parse(json))
      .then((data) => versions.set({ data, loading: false, refetchOnInvalidate: false }))
      .catch((err) => {
        console.error(JSON.stringify(err, null, 2));
      });
  }

  return { versions };
}) satisfies LayoutLoad;

const versionSchema = z.object({
  id: z.number(),
  contentType: z.string(),
  relatedDocumentId: z.string(),
  locale: z.string().nullable(),
  status: z.literal('published').or(z.literal('draft')).or(z.literal('modified')),
  schema: z.object({}).passthrough(),
  data: z.object({}).passthrough(),
  createdAt: z.string(),
  createdBy: z.object({
    id: z.number(),
    username: z.string().nullable(),
    email: z.string().nullable(),
    firstname: z.string(),
    lastname: z.string(),
  }),
  meta: z.object({}).passthrough(),
});

const versionsDataSchema = z.object({
  data: z.array(versionSchema),
  meta: z.object({
    pagination: z.object({
      page: z.number(),
      pageSize: z.number(),
      pageCount: z.number(),
      total: z.number(),
    }),
  }),
});
