import { graphql } from '$houdini';
import { redirect } from '@sveltejs/kit';
import type { AfterLoadEvent, ContentPageVariablesType } from './$houdini';

export const houdini_load = graphql`
  query ContentPage($slug: String!) {
    contentBySlugPublic(slug: $slug) {
      _id
      name
      body
      dual_columns
      timestamps {
        void
      }
      alert
      aliases
      enable_password_protection
      quick_links {
        label
        path
      }
      show_table_of_contents
    }
  }
`;

// This is the function for the AllItems query.
// Query variable functions must be named <QueryName>Variables.
export const ContentPageVariables: ContentPageVariablesType = ({ params }) => {
  return {
    slug: params.contentPath.endsWith('/') ? params.contentPath.slice(0, -1) : params.contentPath,
  };
};

export async function afterLoad({ data, event }: AfterLoadEvent) {
  if (data.ContentPage.contentBySlugPublic?.enable_password_protection) {
    const { session } = await event.parent();
    if (session.authenticated !== true) {
      throw redirect(302, `/basic-login?from=${encodeURIComponent(event.url.href)}`);
    }
  }
}
