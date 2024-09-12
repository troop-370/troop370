import { redirect } from '@sveltejs/kit';
import validator from 'validator';
import { z } from 'zod';
import { fromError } from 'zod-validation-error';
import { updateBreadcrumbs } from '../updateBreadcrumbs';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ locals, url }) => {
  await updateBreadcrumbs(locals.session, {
    label: 'Payment method',
    href: '/pay/pinestraw/checkout/payment',
  });

  return {};
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request, locals }) => {
    const data = Object.fromEntries((await request.formData()).entries());

    if (!data.payment_method) {
      return { error: 'Payment method is required', data };
    }

    await locals.session.update((session) => ({
      ...session,
      'store.pinestraw.checkout.payment_method': data.payment_method.toString(),
    }));

    redirect(303, '/pay/pinestraw/checkout/payment/' + data.payment_method.toString());
  },
} satisfies Actions;
