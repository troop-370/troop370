import { apity } from '$api';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const getContentPages = apity.path('/pages').method('get').create();

export const load: PageServerLoad = async ({ fetch, parent, url }) => {
  const { session } = await parent();
  const previewId = url.searchParams.get('previewId');

  // get the pine straw page
  const { result } = getContentPages(
    {
      filters: { path: '/events/pinestraw', previewId },
      publicationState: previewId ? 'preview' : 'live',
      populate: 'quick_links',
    },
    fetch
  );
  const resolved = await result;
  if (!resolved.ok) throw error(resolved.status, 'server error');
  if (!resolved.data.data || resolved.data.data.length < 1) throw error(404, 'not found');
  if (!resolved.data.data[0].attributes) throw error(404, 'missing');
  const page = resolved.data.data[0].attributes;

  return {
    page: page,
    authStrings: session.authStrings,
  };
};
