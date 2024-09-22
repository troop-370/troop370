import { apity } from '$api';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const getContentPages = apity.path('/pages').method('get').create();

export const load: PageServerLoad = async ({ params, fetch, parent, url }) => {
  const endsHtml = params.contentPath.endsWith('.html');
  const endsHtm = params.contentPath.endsWith('.htm');
  if (endsHtml || endsHtm) {
    redirect(307, `/${params.contentPath.slice(0, endsHtml ? -5 : -4)}`);
  }

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
    redirect(307, foundRedirect.to);
  }

  // construct the matching path with a leading forward slash and no trailing slash
  const matchPath =
    `/` + (params.contentPath.endsWith('/') ? params.contentPath.slice(0, -1) : params.contentPath);

  // get the page with the matching path
  const { result } = getContentPages(
    {
      filters: { path: matchPath, previewId,  },
      // @ts-expect-error status is not in the type definition because it is not in the openapi.json schema
      status: previewId ? 'draft' : 'published',
      populate: 'quick_links',
    },
    fetch
  );
  const resolved = await result;
  if (!resolved.ok) error(resolved.status, 'server error');
  if (!resolved.data.data || resolved.data.data.length < 1) error(404, 'not found');
  if (!resolved.data.data[0]) error(404, 'missing');
  const page = resolved.data.data[0];

  // redirect to login if password authentication is required
  if (page.enable_password_protection) {
    if (session.authenticated !== true) {
      redirect(302, `/basic-login?from=${encodeURIComponent(url.href)}`);
    }
  }

  return {
    page: page,
    authStrings: session.authStrings,
  };
};
