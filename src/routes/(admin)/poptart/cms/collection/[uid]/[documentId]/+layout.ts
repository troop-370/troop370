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

  const stages = writable<{
    data: z.infer<typeof stagesDataSchema> | null;
    loading: boolean;
    refetchOnInvalidate: boolean;
  }>({
    data: null,
    loading: false,
    refetchOnInvalidate: false,
  });

  if (!get(stages).data || get(stages).refetchOnInvalidate) {
    stages.set({ data: null, loading: true, refetchOnInvalidate: false });
    fetch(
      `/strapi/review-workflows/content-manager/collection-types/${params.uid}/${params.documentId}/stages`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.adminToken}`,
        },
      }
    )
      .then((res) => res.json())
      .then((json) => stagesDataSchema.parse(json))
      .then((data) => stages.set({ data, loading: false, refetchOnInvalidate: false }))
      .catch((err) => {
        console.error(JSON.stringify(err, null, 2));
      });
  }

  return { versions, stages };
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

const stageSchema = z.object({
  color: z.string(),
  createdAt: z.string(),
  documentId: z.string(),
  id: z.number(),
  locale: z.string().nullable(),
  name: z.string(),
  publishedAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

const stagesDataSchema = z.object({
  data: z.array(stageSchema),
  meta: z.object({
    stageCount: z.number(),
    workflowCount: z.number(),
  }),
});
