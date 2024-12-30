import { apity } from '$api';
import { HardBreak } from '$pm/render/HardBreak';
import { Link } from '$pm/render/Link';
import { notEmpty } from '$utils';
import { getPostButtonInfo } from '$utils/getPostButtonInfo';
import Renderer from '@cristata/prosemirror-to-html-js';
import type { ProsemirrorDocNode } from '@cristata/prosemirror-to-html-js/dist/Renderer';
import { error } from '@sveltejs/kit';
import { copy } from 'copy-anything';
import { isString } from 'is-what';
import { DOMParser } from 'xmldom';
import type { PageServerLoad } from './$types';

const getPosts = apity.path('/posts').method('get').create();

export const load: PageServerLoad = async ({ params, parent, url }) => {
  // get the posts
  const { result } = getPosts(
    {
      sort: 'shortPublishedAt:desc',
      'pagination[page]': parseInt(params.page),
      'pagination[pageSize]': 25,
      filters:
        params.category !== 'all' ? { category: { value: { $eq: params.category } } } : undefined,
      populate: 'category',
    },
    fetch
  );
  const resolved = await result;
  if (!resolved.ok) error(resolved.status, 'server error');
  if (!resolved.data.data) error(404, 'not found');

  const { session } = await parent();

  const docs = resolved.data.data.filter(notEmpty).map((d) => {
    // convert the json body to html
    const bodyContent = JSON.parse(d.body || '[]') as ProsemirrorDocNode[];
    let body = '';
    try {
      const renderer = new Renderer.Renderer();
      renderer.addNode(HardBreak);
      renderer.addMark(Link);
      body = renderer.render({
        type: 'doc',
        content: copy(bodyContent),
      });
    } catch (err) {
      console.error(err);
    }

    const { buttonTextOverride, hrefOverride } = getPostButtonInfo(bodyContent);

    return {
      slug: d.slug,
      timestamps: {
        published_at: d.publishedAt,
        short_published_at: d.shortPublishedAt,
      },
      submitted_by: d.submitted_by?.split(';').map((name) => name.trim()) || [],
      name: d.title,
      body:
        (d.enable_password_protection && session.authenticated !== true) ||
        (buttonTextOverride && hrefOverride)
          ? null
          : body,
      button_text: buttonTextOverride || d.button_text || 'Read more',
      enable_password_protection: d.enable_password_protection,
      href: hrefOverride ? hrefOverride : undefined,
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
