import { apity } from '$api';
import { notEmpty } from '$utils';
import { error } from '@sveltejs/kit';
import type { Node } from 'blocks-html-renderer';
import type { PageServerLoad } from './$types';

const getPosts = apity.path('/posts').method('get').create();

export const load: PageServerLoad = async ({ params, parent, url }) => {
  // get the posts
  const { result } = getPosts(
    {
      sort: 'shortPublishedAt:desc',
      filters:
        params.category !== 'all' ? { category: { value: { $eq: params.category } } } : undefined,
      populate: 'category',
    },
    fetch
  );
  const resolved = await result;
  if (!resolved.ok) throw error(resolved.status, 'server error');
  if (!resolved.data.data) throw error(404, 'not found');

  const docs = resolved.data.data
    .map((d) => d.attributes)
    .filter(notEmpty)
    .map((d) => {
      return {
        slug: d.slug,
        timestamps: {
          published_at: d.publishedAt,
          short_published_at: d.shortPublishedAt,
        },
        submitted_by: ['IDK'],
        name: d.title,
        body: d.body as Node[],
        button_text: d.button_text || 'Read more',
        enable_password_protection: d.enable_password_protection,
      };
    });

  const pagination = resolved.data.meta?.pagination;
  const page = pagination?.page || parseInt(params.page);

  return {
    posts: {
      docs,
      hasNextPage: (pagination?.pageCount || 1) > page,
      hasPrevPage: page > 1,
      page,
    },
  };
};
