import { graphql } from '$houdini';
import { redirect } from '@sveltejs/kit';
import type { AfterLoadEvent, NewsletterVariables } from './$houdini';

export const _houdini_load = graphql`
  query Newsletter($_id: ObjectID!) {
    newsletterPublic(_id: $_id) {
      _id
      name
      timestamps {
        published_at
      }
      announcements {
        name
        description
        body
        legacy_markdown
        categories
        submitted_by
      }
      past_announcements {
        slug
        name
        description
        button_text
        categories
        submitted_by
      }
      advancement_mini_posts {
        slug
        name
        description
        button_text
      }
      fundraiser_mini_posts {
        slug
        name
        description
        button_text
      }
      camping_mini_posts {
        slug
        name
        description
        button_text
      }
      service_mini_posts {
        slug
        name
        description
        button_text
      }
      high_adventure_mini_posts {
        slug
        name
        description
        button_text
      }
      pinned_mini_posts {
        slug
        name
        description
        button_text
        categories
        submitted_by
      }
      manual_calendar {
        month
        events
      }
    }
  }
`;

// This is the function for the AllItems query.
// Query variable functions must be named <QueryName>Variables.
export const _NewsletterVariables: NewsletterVariables = ({ params }) => {
  return {
    _id: params._id,
  };
};

export async function _houdini_afterLoad({ data, event }: AfterLoadEvent) {
  if (data.Newsletter.newsletterPublic) {
    const { session } = await event.parent();
    if (session.authenticated !== true) {
      throw redirect(302, `/basic-login?from=${encodeURIComponent(event.url.href)}`);
    }
  }
}
