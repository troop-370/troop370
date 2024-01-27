import { apity } from '$api';
import type { PageServerLoad } from './$types';

const getContentPages = apity.path('/pages').method('get').create();

export const load: PageServerLoad = async ({ params }) => {
  // construct the matching path with a leading forward slash and no trailing slash
  const matchPath =
    `/` + params.contentPath.endsWith('/') ? params.contentPath.slice(0, -1) : params.contentPath;

  // get the page with the matching path
  getContentPages({
    filters: {
      path: matchPath as never,
    },
  });

  return {};
};
