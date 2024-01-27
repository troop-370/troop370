import { graphql } from '$houdini';
import { redirect } from '@sveltejs/kit';
import type { AfterLoadEvent, StandaloneEmailVariables } from './$houdini';

export const _houdini_load = graphql`
  query StandaloneEmail($_id: ObjectID!) {
    standaloneEmailPublic(_id: $_id) {
      _id
      name
      header_date
      body
      legacy_markdown
      sender_name
    }
  }
`;

// This is the function for the AllItems query.
// Query variable functions must be named <QueryName>Variables.
export const _StandaloneEmailVariables: StandaloneEmailVariables = ({ params }) => {
  return {
    _id: params._id,
  };
};

export async function _afterLoad({ data, event }: AfterLoadEvent) {
  if (data.StandaloneEmail.standaloneEmailPublic) {
    const { session } = await event.parent();
    if (session.authenticated !== true) {
      throw redirect(302, `/basic-login?from=${encodeURIComponent(event.url.href)}`);
    }
  }
}
