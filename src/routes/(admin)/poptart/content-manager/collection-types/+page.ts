import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ parent }) => {
  const { cmsContentTypes } = await parent();
  if (cmsContentTypes) {
    redirect(302, `/poptart/cms/collection/api::post.post?publishedAt={"$null":true}`);
  }
  redirect(302, `/poptart/cms`);
}) satisfies PageLoad;
