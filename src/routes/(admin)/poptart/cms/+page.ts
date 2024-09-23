import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';

export const load = (async ({ parent }) => {
  const { cmsContentTypes } = await parent();
  if (cmsContentTypes) {
    const $cmsContentTypes = get(cmsContentTypes);
    if ($cmsContentTypes && $cmsContentTypes.length > 0) {
      const uids = $cmsContentTypes.map(({ uid }) => uid);
      if (uids.includes('api::post.post')) {
        redirect(302, `/poptart/cms/collection/api::post.post?publishedAt={"$null":true}`);
      } else {
        redirect(302, `/poptart/cms/collection/${$cmsContentTypes[0].uid}`);
      }
    }
  }

  redirect(302, `/poptart/cms`);
}) satisfies PageLoad;
