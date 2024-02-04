import { apity } from '$api';
import { notEmpty } from '$utils';
import { error, redirect } from '@sveltejs/kit';
import { renderBlock, type Node } from 'blocks-html-renderer';
import { DOMParser } from 'xmldom';
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
    submitted_by: post.submitted_by?.split(';').map((name) => name.trim()) || [],
    name: post.title,
    body: addRippleDiv(parseBody(post.body as Node[])),
    enable_password_protection: post.enable_password_protection,
    categories: post.category?.data?.attributes?.value,
    tags: post.tags?.data?.filter(notEmpty).map((tag) => tag.attributes?.value),
    description: post.subtitle,
  };

  return { post: _post };
};

function parseBody(body: Node[]) {
  if (DOMParser) {
    const html = renderBlock(body);

    if (html) {
      const dom = new DOMParser().parseFromString(html, 'text/html');

      /**
       * Style the buttons in the content,
       */
      const anchors = dom.getElementsByTagName('a') || []; // get all anchors in document
      Array.from(anchors).forEach((anchor, i) => {
        const buttonText = anchor.textContent || ''; // get text of anchor
        const buttonTypeOutlined = buttonText.includes('.ob'); // check if anchor includes the text '.ob'
        const buttonTypeRegular = buttonText.includes('.pb'); // check if anchor includes the text '.b'
        if (buttonTypeOutlined === true) {
          // only do the following if the anchor includes the text '.ob'
          anchors[i].textContent = buttonText.replace('.ob', '');
          anchors[i].setAttribute('class', 'mdc-button mdc-button--outlined');
        }
        if (buttonTypeRegular === true) {
          // only do the following if the anchor includes the text '.b'
          anchors[i].textContent = buttonText.replace('.pb', '');
          anchors[i].setAttribute('class', 'mdc-button');
        }
      });

      return dom.toString() || html || '';
    }

    return html || '';
  }

  return JSON.stringify(body || '') || '';
}

function addRippleDiv(body: string) {
  return body
    .replaceAll(
      ' class="mdc-button mdc-button--outlined">',
      ' class="mdc-button mdc-button--outlined"><span class="mdc-button__ripple"></span>'
    )
    .replaceAll(
      ' class="mdc-button">',
      ' class="mdc-button"><span class="mdc-button__ripple"></span>'
    );
}
