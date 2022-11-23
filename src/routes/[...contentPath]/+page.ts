import { graphql } from '$houdini';
import type { ContentPageVariablesType } from './$houdini';

export const houdini_load = graphql`
  query ContentPage($slug: String!) {
    contentBySlugPublic(slug: $slug) {
      _id
      name
      body
      columns
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
