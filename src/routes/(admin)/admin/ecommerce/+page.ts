import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async () => {
  throw redirect(302, '/admin/ecommerce/orders');
}) satisfies PageLoad;
