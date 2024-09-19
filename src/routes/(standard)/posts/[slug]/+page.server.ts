import { apity } from '$api';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const getPosts = apity.path('/posts').method('get').create();

export const load: PageServerLoad = async ({ params, url }) => {
  const previewId = url.searchParams.get('previewId');

  const { result } = getPosts(
    {
      sort: 'shortPublishedAt:desc',
      filters: { slug: params.slug, previewId },
      publicationState: previewId ? 'preview' : 'live',
    },
    fetch
  );
  const resolved = await result;
  if (!resolved.ok) error(resolved.status, 'server error');
  if (!resolved.data.data || resolved.data.data.length < 1) error(404, 'not found');

  if (resolved.data.data[0].attributes?.shortPublishedAt) {
    const date = new Date(resolved.data.data[0].attributes.shortPublishedAt);
    const yyyy = date.getUTCFullYear();
    const mm = date.getUTCMonth() + 1;
    const dd = date.getUTCDate();
    redirect(307, `/posts/${yyyy}/${mm}/${dd}/${params.slug}?${url.searchParams}`);
  }

  if (previewId) {
    redirect(307, `/posts/0001/01/01/${params.slug}?${url.searchParams}`);
  }

  error(500, 'missing published date');
};
