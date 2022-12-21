import { graphql } from '$houdini';
import { redirect } from '@sveltejs/kit';
import type { AfterLoadEvent, PostSlugVariablesType } from './$houdini';

export const houdini_load = graphql`
  query PostSlug($slug: String!) {
    postBySlugPublic(slug: $slug) {
      timestamps {
        published_at
      }
    }
  }
`;

// This is the function for the AllItems query.
// Query variable functions must be named <QueryName>Variables.
export const PostSlugVariables: PostSlugVariablesType = ({ params }) => {
  return {
    slug: params.slug,
  };
};

export async function afterLoad({ data, event }: AfterLoadEvent) {
  if (data.PostSlug.postBySlugPublic?.timestamps?.published_at) {
    const date = new Date(data.PostSlug.postBySlugPublic.timestamps.published_at);
    const yyyy = date.getUTCFullYear();
    const mm = date.getUTCMonth() + 1;
    const dd = date.getUTCDay() + 1;
    throw redirect(307, `/posts/${yyyy}/${mm}/${dd}/${event.params.slug}`);
  }
}
