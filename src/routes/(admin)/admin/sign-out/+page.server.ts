import type { PageServerLoad } from './$types';

export const load = (async ({ fetch, locals }) => {
  await fetch('/admin/strapi/admin/logout', {
    headers: { Authorization: `Bearer ${locals.session.data.adminToken}` },
  });

  await locals.session.set({
    ...locals.session.data,
    adminEmail: undefined,
    adminPass: undefined,
    adminToken: undefined,
    adminUser: undefined,
    admin: undefined,
  });

  return {};
}) satisfies PageServerLoad;
