import { apity } from '$api';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const getContentPages = apity.path('/pages').method('get').create();

export const load: PageServerLoad = async ({ params, fetch, parent, url }) => {
  const { redirects, session } = await parent();
  const previewId = url.searchParams.get('previewId');

  // check for redirects
  const foundRedirect = redirects.find((redirect) => {
    const path = params.contentPath.split('.')[0];
    const redirectFrom = redirect.from.slice(1); // remove leading slash

    // in case there is a trailing slash, check equality with last character removed
    return path === redirectFrom || path.slice(0, -1) === redirectFrom;
  });
  if (foundRedirect) {
    throw redirect(307, foundRedirect.to);
  }

  // construct the matching path with a leading forward slash and no trailing slash
  const matchPath =
    `/` + (params.contentPath.endsWith('/') ? params.contentPath.slice(0, -1) : params.contentPath);

  // get the page with the matching path
  const { result } = getContentPages(
    {
      filters: { path: matchPath, previewId },
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

  // redirect to login if password authentication is required
  if (page.enable_password_protection) {
    if (session.authenticated !== true) {
      throw redirect(302, `/basic-login?from=${encodeURIComponent(url.href)}`);
    }
  }

  return {
    page: page,
    authStrings: session.authStrings,
  };
};
