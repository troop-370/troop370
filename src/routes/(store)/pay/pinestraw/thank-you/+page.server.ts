import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
  // remove all store.pinestraw.checkout.* session data
  await locals.session.update((session) => {
    const keys = Object.keys(session);
    for (const key of keys) {
      if (key.startsWith('store.pinestraw.checkout.')) {
        session[key] = undefined;
      }
    }
    return session;
  });
  return {};
}) satisfies PageServerLoad;
