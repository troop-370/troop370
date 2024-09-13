import { redirect } from '@sveltejs/kit';
import { updateBreadcrumbs } from '../../../../updateBreadcrumbs';
import type { Actions, PageServerLoad } from '../check/$types';

export const load = (async ({ locals, url }) => {
  await updateBreadcrumbs(locals.session, {
    label: 'Check payment',
    href: '/pay/pinestraw/checkout/payment/check',
  });

  return {};
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request }) => {
    const data = Object.fromEntries((await request.formData()).entries());

    redirect(303, '/pay/pinestraw/thank-you?payment_method=check');
  },
} satisfies Actions;
