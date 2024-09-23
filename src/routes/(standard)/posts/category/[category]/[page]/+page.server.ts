import { apity } from '$api';
import { notEmpty } from '$utils';
import { error } from '@sveltejs/kit';
import { renderBlock, type Node } from 'blocks-html-renderer';
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
    const buttonTextOverride = (() => {
      if (d.body && Array.isArray(d.body) && d.body.length === 1 && DOMParser) {
        const html = renderBlock(d.body.filter((node) => node.type === 'paragraph'));

        if (html) {
          const dom = new DOMParser().parseFromString(html, 'text/html');

          let _text = '';
          Array.from(dom.childNodes)
            .filter((node): node is Element => node.nodeType === 1)
            .map((node) => {
              _text += node.textContent + ' ' || '';
            });

          const text = _text.trim();
          if (text.endsWith('.ob') || text.endsWith('.pb')) {
            return _text.replace(/\.ob|\.pb/g, '');
          }
        }
      }
    })();

    const hrefOverride = (() => {
      if (
        buttonTextOverride &&
        d.body &&
        Array.isArray(d.body) &&
        d.body.length === 1 &&
        DOMParser
      ) {
        const html = renderBlock(d.body.filter((node) => node.type === 'paragraph'));

        if (html) {
          const dom = new DOMParser().parseFromString(html, 'text/html');

          let _text = '';
          const anchors = Array.from(dom.childNodes)
            .flatMap((node) => Array.from(node.childNodes))
            .filter((node): node is Element => node.nodeType === 1)
            .filter((node): node is HTMLAnchorElement => node.tagName === 'a');

          if (
            anchors.length === 1 &&
            (!d.enable_password_protection ||
              (d.enable_password_protection && session.authenticated === true))
          ) {
            return anchors[0].getAttribute('href');
          }
        }
      }
    })();

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
          ? []
          : (d.body as Node[]),
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
