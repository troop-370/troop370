import { graphql } from '$houdini';
import { HardBreak } from '$pm/render/HardBreak';
import { Link } from '$pm/render/Link';
import { Markdown } from '$utils';
import { isJSON } from '$utils/isJSON';
import Renderer from '@cristata/prosemirror-to-html-js';
import { redirect } from '@sveltejs/kit';
import type { AfterLoadEvent, PostVariables } from './$houdini';

export const _houdini_load = graphql`
  query Post($slug: String!, $date: Date) {
    postBySlugPublic(slug: $slug, date: $date) {
      slug
      timestamps {
        published_at
      }
      submitted_by
      name
      body
      enable_password_protection
      legacy_markdown
      categories
      tags
      description
    }
  }
`;

// This is the function for the AllItems query.
// Query variable functions must be named <QueryName>Variables.
export const _PostVariables: PostVariables = ({ params }) => {
  const date = new Date(`${params.yyyy}/${params.mm}/${params.dd}`);
  date.setUTCHours(0, 0, 0, 0);
  const shortDate = date.toISOString().split('T')[0];

  return {
    slug: params.slug,
    date: shortDate,
  };
};

export async function _houdini_houdini_afterLoad({ data, event }: AfterLoadEvent) {
  if (data.Post.postBySlugPublic?.enable_password_protection) {
    const { session } = await event.parent();
    if (session.authenticated !== true) {
      throw redirect(302, `/basic-login?from=${encodeURIComponent(event.url.href)}`);
    }
  }

  let bodyHtml = '';
  if (data.Post.postBySlugPublic) {
    if (data.Post.postBySlugPublic.legacy_markdown) {
      const [, html] = Markdown.parse(data.Post.postBySlugPublic.body);
      bodyHtml = html;
    } else {
      const renderer = new Renderer.Renderer();
      renderer.addMark(Link);
      renderer.addNode(HardBreak);
      bodyHtml = renderer.render({
        type: 'doc',
        content: isJSON(data.Post.postBySlugPublic.body)
          ? JSON.parse(data.Post.postBySlugPublic.body)
          : [],
      });
    }
  }

  return { html: bodyHtml };
}
