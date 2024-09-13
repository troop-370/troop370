import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ fetch, locals }) => {
  await locals.session.update((session) => ({
    ...session,
    'store.pinestraw.checkout.breadcrumbs': [
      { label: 'Home', href: '/' },
      { label: 'Payments' },
      {
        label: 'Pine straw fundraiser',
        href: '/pay/pinestraw',
      },
    ],
  }));

  return {};
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request, locals }) => {
    const data = await request.formData();

    await locals.session.update((session) => ({
      ...session,
      'store.pinestraw.checkout.bale_quantity': data.get('bale_quantity')?.toString() || '1',
      'store.pinestraw.checkout.spread_quantity': data.get('spread_quantity')?.toString() || '0',
    }));

    redirect(303, '/pay/pinestraw/checkout');
  },
} satisfies Actions;