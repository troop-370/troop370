import type { LayoutLoad } from './$types';

export const load = (async ({ params, fetch, parent }) => {
  const { session } = await parent();

  const versions = fetch(
    `/strapi/content-manager/history-versions?contentType=${params.uid}&documentId=${params.documentId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.adminToken}`,
      },
    }
  ).then((res) => res.json());

  return { versions: await versions };
}) satisfies LayoutLoad;
