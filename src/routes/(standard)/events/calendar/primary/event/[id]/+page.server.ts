import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, url, params }) => {
  const { session, calendar } = await parent();

  if (session.authenticated !== true) {
    throw redirect(302, `/basic-login?from=${encodeURIComponent(url.href)}`);
  }

  const item = calendar.items.find((item) => item.id === params.id);
  if (item?.htmlLink) {
    throw redirect(307, item.htmlLink);
  }

  throw error(500, new Error('could not find link to calendar event'));
};
