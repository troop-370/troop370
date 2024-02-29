import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ parent }) => {
  const { session } = await parent();
  const userRoles = session.adminUser?.roles?.map((role) => role.name);

  if (userRoles?.includes('Store Manager')) {
    throw redirect(302, '/admin/ecommerce');
  }

  throw redirect(302, '/admin/cms');
}) satisfies PageLoad;
