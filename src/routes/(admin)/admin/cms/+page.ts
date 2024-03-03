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
        throw redirect(302, `/admin/cms/collection/api::post.post?publishedAt={"$null":true}`);
      } else {
        throw redirect(302, `/admin/cms/collection/${$cmsContentTypes[0].uid}`);
      }
    }
  }

  throw redirect(302, `/admin/cms`);
}) satisfies PageLoad;
