import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
  throw redirect(302, `/admin/cms/collection/${params.uid}`);
}) satisfies PageLoad;
