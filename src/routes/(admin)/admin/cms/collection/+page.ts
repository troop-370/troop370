import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ parent }) => {
  const { cmsContentTypes } = await parent();
  if (cmsContentTypes) {
    throw redirect(302, `/admin/cms/collection/${cmsContentTypes[0].uid}`);
  }
  throw redirect(302, `/admin/cms`);
}) satisfies PageLoad;
