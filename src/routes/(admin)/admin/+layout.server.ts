import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ parent, url }) => {
  const { session } = await parent();

  if (url.pathname === '/admin/login') return {};

  if (!session.adminLastAuth) {
    throw redirect(302, `/admin/login?from=${encodeURIComponent(url.href)}`);
  }

  const lastAuthIsMoreThan1HourAgo =
    new Date(session.adminLastAuth).getTime() - new Date().getTime() > 1000 * 3600;
  if (lastAuthIsMoreThan1HourAgo) {
    throw redirect(302, `/admin/login?from=${encodeURIComponent(url.href)}`);
  }

  return {};
}) satisfies LayoutServerLoad;
