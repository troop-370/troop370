import { graphql } from '$houdini';
import type { PostsVariablesType } from './$houdini';

export const houdini_load = graphql`
  query Posts($limit: Int!, $page: Int, $sort: JSON, $filter: JSON) {
    postsPublic(limit: $limit, page: $page, sort: $sort, filter: $filter) {
      docs {
        slug
        timestamps {
          published_at
        }
        submitted_by
        name
        body
        button_text
        enable_password_protection
        legacy_markdown
      }
      hasNextPage
      hasPrevPage
      page
    }
  }
`;

// This is the function for the AllItems query.
// Query variable functions must be named <QueryName>Variables.
export const PostsVariables: PostsVariablesType = ({ params }) => {
  return {
    limit: 10,
    page: parseInt(params.page),
    sort: JSON.stringify({ 'timestamps.published_at': -1 }),
    filter:
      params.category !== 'all'
        ? JSON.stringify({ categories: params.category })
        : JSON.stringify({}),
  };
};
