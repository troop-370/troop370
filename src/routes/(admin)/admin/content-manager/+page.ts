import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ parent }) => {
  const { cmsContentTypes } = await parent();
  if (cmsContentTypes) {
    redirect(302, `/admin/cms/collection/api::post.post?publishedAt={"$null":true}`);
  }
  redirect(302, `/admin/cms`);
}) satisfies PageLoad;
