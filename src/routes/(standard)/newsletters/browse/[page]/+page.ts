import { graphql } from '$houdini';
import { error, redirect } from '@sveltejs/kit';
import type { AfterLoadEvent, NewslettersVariables } from './$houdini';

export const _houdini_load = graphql`
  query Newsletters($limit: Int!, $page: Int, $sort: JSON, $filter: JSON) {
    newslettersPublic(limit: $limit, page: $page, sort: $sort, filter: $filter) {
      docs {
        _id
        name
        timestamps {
          published_at
        }
      }
      hasNextPage
      hasPrevPage
      page
    }
  }
`;

// This is the function for the AllItems query.
// Query variable functions must be named <QueryName>Variables.
export const _NewslettersVariables: NewslettersVariables = ({ params }) => {
  return {
    limit: 10,
    page: parseInt(params.page),
    sort: JSON.stringify({ 'timestamps.published_at': -1 }),
    filter: JSON.stringify({}),
  };
};

// check for presence of data before allowing page to load
export async function _afterLoad({ data, event }: AfterLoadEvent) {
  if (!data.Newsletters.newslettersPublic) {
    throw error(404);
  }

  const { session } = await event.parent();
  if (session.authenticated !== true) {
    throw redirect(302, `/basic-login?from=${encodeURIComponent(event.url.href)}`);
  }
}
