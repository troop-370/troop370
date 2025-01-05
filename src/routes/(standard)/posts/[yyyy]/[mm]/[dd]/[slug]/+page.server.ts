import { apity } from '$api';
import { parseBody } from '$components/Post/parseBody';
import { PUBLIC_NEW_FILESTORE_PATH, PUBLIC_OLD_FILESTORE_PATH } from '$env/static/public';
import { notEmpty } from '$utils';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const getPosts = apity.path('/posts').method('get').create();

export const load: PageServerLoad = async ({ params, parent, url }) => {
  const previewId = url.searchParams.get('previewId');

  const date = new Date(`${params.yyyy}-${params.mm}-${params.dd}`);
  date.setUTCHours(0, 0, 0, 0);
  const shortDate = date.toISOString().split('T')[0];

  const { result } = getPosts(
    {
      sort: 'shortPublishedAt:desc',
      filters: {
        slug: params.slug,
        shortPublishedAt: previewId ? undefined : shortDate,
        previewId,
      },
      populate: 'category, tags, cover_photo',
      // @ts-expect-error status is not in the type definition because it is not in the openapi.json schema
      status: previewId ? 'draft' : 'published',
    },
    fetch
  );
  const resolved = await result;
  if (!resolved.ok) error(resolved.status, 'server error');
  if (!resolved.data.data || resolved.data.data.length < 1) error(404, 'not found');

  const post = resolved.data.data[0];
  if (!post) error(404, 'not found');

  // redirect to login if password protection is required
  if (post.enable_password_protection) {
    const { session } = await parent();
    if (session.authenticated !== true) {
      redirect(302, `/basic-login?from=${encodeURIComponent(url.href)}`);
    }
  }

  const _post = {
    slug: post.slug,
    timestamps: {
      published_at: post.shortPublishedAt || post.publishedAt,
    },
    submitted_by: post.submitted_by?.split(';').map((name) => name.trim()) || [],
    name: post.title,
    body: parseBody(post.body, post.theme === 'blog' ? 'paladin2020' : 'default'),
    enable_password_protection: post.enable_password_protection,
    categories: [post.category?.value].filter(notEmpty),
    tags: post.tags?.filter(notEmpty).map((tag) => tag?.value),
    description: post.subtitle,
    theme: post.theme,
    cover_photo: post.cover_photo?.url?.replace(
      PUBLIC_OLD_FILESTORE_PATH,
      PUBLIC_NEW_FILESTORE_PATH.replace('https://troop370atlanta.org', url.origin)
    ),
    cover_photo_credit: post.cover_photo?.caption,
    cover_photo_caption: post.cover_photo_caption,
  };

  return { post: _post };
};
