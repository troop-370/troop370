import { apity } from '$api';
import { notEmpty } from '$utils';
import { error, redirect } from '@sveltejs/kit';
import type { Node } from 'blocks-html-renderer';
import type { PageServerLoad } from './$types';

const getPosts = apity.path('/posts').method('get').create();

export const load: PageServerLoad = async ({ params, parent, url }) => {
  const previewId = url.searchParams.get('previewId');

  const date = new Date(`${params.yyyy}/${params.mm}/${params.dd}`);
  date.setUTCHours(0, 0, 0, 0);
  const shortDate = date.toISOString().split('T')[0];

  const { result } = getPosts(
    {
      sort: 'shortPublishedAt:desc',
      filters: { slug: params.slug, shortPublishedAt: shortDate, previewId },
      populate: 'category, tags',
      publicationState: previewId ? 'preview' : 'live',
    },
    fetch
  );
  const resolved = await result;
  if (!resolved.ok) throw error(resolved.status, 'server error');
  if (!resolved.data.data || resolved.data.data.length < 1) throw error(404, 'not found');

  const post = resolved.data.data[0].attributes;
  if (!post) throw error(404, 'not found');

  // redirect to login if password protection is required
  if (post.enable_password_protection) {
    const { session } = await parent();
    if (session.authenticated !== true) {
      throw redirect(302, `/basic-login?from=${encodeURIComponent(url.href)}`);
    }
  }

  const _post = {
    slug: post.slug,
    timestamps: {
      published_at: post.publishedAt,
    },
    submitted_by: [],
    name: post.title,
    body: post.body as Node[],
    enable_password_protection: post.enable_password_protection,
    categories: post.category?.data?.attributes?.value,
    tags: post.tags?.data?.filter(notEmpty).map((tag) => tag.attributes?.value),
    description: post.subtitle,
  };

  return { post: _post };
};
