import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
  redirect(302, `/poptart/cms/collection/${params.uid}`);
}) satisfies PageLoad;
