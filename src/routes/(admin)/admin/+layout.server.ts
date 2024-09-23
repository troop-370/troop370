import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ url }) => {
  const pathname = url.pathname.replace('/admin', '/poptart');
  const newUrl = new URL(pathname + url.search, url.origin);
  redirect(307, newUrl);
}) satisfies LayoutServerLoad;
