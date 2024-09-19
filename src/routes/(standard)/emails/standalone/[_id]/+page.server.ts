import { apity, type ApiTypes } from '$api';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const getStandaloneEmails = apity.path('/standalone-emails').method('get').create();

export const load: PageServerLoad = async ({ params, parent, url }) => {
  const previewId = url.searchParams.get('previewId');

  // get the page with the matching path
  const { result } = getStandaloneEmails(
    {
      filters: { object_id: params._id, previewId },
      publicationState: previewId ? 'preview' : 'live',
    },
    fetch
  );
  const resolved = await result;
  if (!resolved.ok) error(resolved.status, 'server error');
  if (!resolved.data.data || resolved.data.data.length < 1) error(404, 'not found');
  if (!resolved.data.data[0].attributes) error(404, 'missing');
  const email = resolved.data.data[0].attributes as ApiTypes['manualSchemas']['StandaloneEmail'];

  // redirect to login
  if (email) {
    const { session } = await parent();
    if (session.authenticated !== true) {
      redirect(302, `/basic-login?from=${encodeURIComponent(url.href)}`);
    }
  }

  return { email };
};
