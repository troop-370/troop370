import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ parent }) => {
  const { session } = await parent();

  // throw error unless there is access to ecommerce routes
  const userRoles = session.adminUser?.roles?.map((role) => role.name);
  if (!userRoles) throw error(403);
  if (!userRoles.includes('Super Admin') && !userRoles.includes('Store Manager')) throw error(403);

  return {};
}) satisfies LayoutServerLoad;
