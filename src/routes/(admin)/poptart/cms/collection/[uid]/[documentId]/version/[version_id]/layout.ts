// import { z } from 'zod';
// import type { LayoutLoad } from './$types';

// export const load = (async ({ params, fetch, parent }) => {
//   const { session } = await parent();

//   const versions = fetch(
//     `/strapi/content-manager/history-versions?contentType=${params.uid}&documentId=${params.documentId}`,
//     {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${session.adminToken}`,
//       },
//     }
//   )
//     .then((res) => res.json())
//     .then((json) => versionsDataSchema.parse(json));

//   return { versions: await versions };
// }) satisfies LayoutLoad;

// const versionSchema = z.object({
//   id: z.number(),
//   contentType: z.string(),
//   relatedDocumentId: z.string(),
//   locale: z.string().nullable(),
//   status: z.literal('published').or(z.literal('draft')).or(z.literal('modified')),
//   schema: z.object({}).passthrough(),
//   data: z.object({}).passthrough(),
//   createdAt: z.string(),
//   createdBy: z.object({
//     id: z.number(),
//     username: z.string(),
//     email: z.string(),
//     firstname: z.string(),
//     lastname: z.string(),
//   }),
//   meta: z.object({}).passthrough(),
// });

// const versionsDataSchema = z.object({
//   data: z.array(versionSchema),
//   meta: z.object({
//     pagination: z.object({
//       page: z.number(),
//       pageSize: z.number(),
//       pageCount: z.number(),
//       total: z.number(),
//     }),
//   }),
// });
