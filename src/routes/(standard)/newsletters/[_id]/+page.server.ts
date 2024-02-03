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
      publicationState: previewId ? 'preview' : 'live',
      populate:
        'version2, version3.pinned_mini_posts, version3.announcements, version3.past_announcements',
    },
    fetch
  );
  const resolved = await result;
  if (!resolved.ok) throw error(resolved.status, 'server error');
  if (!resolved.data.data || resolved.data.data.length < 1) throw error(404, 'not found');
  if (!resolved.data.data[0].attributes) throw error(404, 'missing');
  const newsletter = resolved.data.data[0].attributes;

  // redirect to login
  if (newsletter) {
    const { session } = await parent();
    if (session.authenticated !== true) {
      throw redirect(302, `/basic-login?from=${encodeURIComponent(url.href)}`);
    }
  }

  return { newsletter: newsletter as ApiTypes['manualSchemas']['Newsletter'] };
};
