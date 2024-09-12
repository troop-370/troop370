import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
  await locals.session.update((session) => ({
    ...session,
    'store.pinestraw.checkout.breadcrumbs': [{ label: 'Home', href: '/' }, { label: 'Payments' }],
  }));

  return {};
}) satisfies PageServerLoad;
