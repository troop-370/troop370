import { apity, type ApiTypes } from '$api';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const getEmailNewsletters = apity.path('/newsletters').method('get').create();

export const load: PageServerLoad = async ({ params, parent, url }) => {
  const previewId = url.searchParams.get('previewId');

  // get the page with the matching path
  const { result } = getEmailNewsletters(
    {
      filters: { object_id: params._id, previewId },
      // @ts-expect-error status is not in the type definition because it is not in the openapi.json schema
      status: previewId ? 'draft' : 'published',
      populate:
        'version3.pinned_mini_posts, version3.pinned_mini_posts.category, ' +
        'version3.announcements, version3.announcements.category, ' +
        'version3.past_announcements, version3.past_announcements.category, ' +
        'version2.pinned_mini_posts, version2.pinned_mini_posts.category, ' +
        'version2.posts, version2.posts.category, ' +
        'version2.fundraiser_mini_posts, version2.fundraiser_mini_posts.category, ' +
        'version2.camping_mini_posts, version2.camping_mini_posts.category, ' +
        'version2.service_mini_posts, version2.service_mini_posts.category, ' +
        'version2.advancement_mini_posts, version2.advancement_mini_posts.category, ' +
        'version2.high_adventure_mini_posts, version2.high_adventure_mini_posts.category, ' +
        'manual_calendar',
    },
    fetch
  );
  const resolved = await result;
  if (!resolved.ok) error(resolved.status, 'server error');
  if (!resolved.data.data || resolved.data.data.length < 1) error(404, 'not found');
  if (!resolved.data.data[0]) error(404, 'missing');
  const newsletter = resolved.data.data[0];

  // redirect to login
  if (newsletter) {
    const { session } = await parent();
    if (session.authenticated !== true) {
      redirect(302, `/basic-login?from=${encodeURIComponent(url.href)}`);
    }
  }

  return { newsletter: newsletter as ApiTypes['manualSchemas']['Newsletter'] };
};
