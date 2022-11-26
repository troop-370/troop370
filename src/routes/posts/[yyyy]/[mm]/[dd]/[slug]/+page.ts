import { graphql } from '$houdini';
import { redirect } from '@sveltejs/kit';
import type { AfterLoadEvent, PostVariablesType } from './$houdini';

export const houdini_load = graphql`
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
export const PostVariables: PostVariablesType = ({ params }) => {
  const date = new Date(`${params.yyyy}/${params.mm}/${params.dd}`);
  date.setUTCHours(0, 0, 0, 0);
  const shortDate = date.toISOString().split('T')[0];

  return {
    slug: params.slug,
    date: shortDate,
  };
};

export async function afterLoad({ data, event }: AfterLoadEvent) {
  if (data.Post.postBySlugPublic?.enable_password_protection) {
    const { session } = await event.parent();
    if (session.authenticated !== true) {
      throw redirect(302, `/basic-login?from=${encodeURIComponent(event.url.href)}`);
    }
  }
}
