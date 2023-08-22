import { graphql } from '$houdini';
import { error, redirect } from '@sveltejs/kit';
import type { AfterLoadEvent, BeforeLoadEvent, ContentPageVariablesType } from './$houdini';

export const houdini_load = graphql`
  query ContentPage($slug: String!) {
    contentBySlugPublic(slug: $slug) {
      _id
      name
      body
      dual_columns
      alert
      aliases
      enable_password_protection
      quick_links {
        label
        path
      }
      show_table_of_contents
      toc_h3_enabled
      center_text
    }
  }
`;

export const beforeLoad = async ({ params, parent }: BeforeLoadEvent) => {
  const { redirects } = await parent();

  const foundRedirect = redirects.find((redirect) => {
    const path = params.contentPath.split('.')[0];
    const redirectFrom = redirect.from.slice(1);

    // in case there is a trailing slash, check equality with last character removed
    return path === redirectFrom || path.slice(0, -1) === redirectFrom;
  });
  if (foundRedirect) {
    throw redirect(307, foundRedirect.to);
  }
};

// This is the function for the AllItems query.
// Query variable functions must be named <QueryName>Variables.
export const ContentPageVariables: ContentPageVariablesType = ({ params }) => {
  return {
    slug: params.contentPath.endsWith('/') ? params.contentPath.slice(0, -1) : params.contentPath,
  };
};

export async function afterLoad({ data, event }: AfterLoadEvent) {
  if (!data.ContentPage.contentBySlugPublic) {
    throw error(404);
  }

  const { session } = await event.parent();

  if (data.ContentPage.contentBySlugPublic?.enable_password_protection) {
    if (session.authenticated !== true) {
      throw redirect(302, `/basic-login?from=${encodeURIComponent(event.url.href)}`);
    }
  }

  return {
    authStrings: session.authStrings,
  };
}
