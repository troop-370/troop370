import { STRAPI_URL } from '$env/static/private';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
  if (!locals.session.data.adminToken) {
    error(401);
  }

  const newToken = await fetch(new URL(STRAPI_URL + '/admin/renew-token'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${locals.session.data.adminToken}`,
    },
    body: JSON.stringify({ token: locals.session.data.adminToken }),
  })
    .then((res) => res.json())
    .then(({ data }) => data.token);

  await locals.session.set({
    ...locals.session.data,
    adminToken: newToken,
  });

  return new Response(newToken);
};
