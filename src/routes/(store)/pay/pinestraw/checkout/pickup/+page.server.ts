import { redirect } from '@sveltejs/kit';
import validator from 'validator';
import { z } from 'zod';
import { fromError } from 'zod-validation-error';
import { updateBreadcrumbs } from '../updateBreadcrumbs';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ locals, url }) => {
  await updateBreadcrumbs(locals.session, {
    label: 'Pickup',
    href: '/pay/pinestraw/checkout/pickup',
  });

  return {};
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request, locals }) => {
    const data = Object.fromEntries((await request.formData()).entries());

    try {
      z.object({
        name: z.string().nonempty(),
        phone: z.string().refine(validator.isMobilePhone),
        conf1: z.literal('true'),
        conf2: z.literal('true'),
        conf3: z.literal('true'),
      }).parse(data);
    } catch (error) {
      const validationError = fromError(error);
      return { error: validationError.toString(), data };
    }

    await locals.session.update((session) => ({
      ...session,
      'store.pinestraw.checkout.name': data.name.toString(),
      'store.pinestraw.checkout.phone': data.phone.toString(),
      'store.pinestraw.checkout.conf1': data.conf1.toString(),
      'store.pinestraw.checkout.conf2': data.conf2.toString(),
      'store.pinestraw.checkout.conf3': data.conf3.toString(),
    }));

    redirect(303, '/pay/pinestraw/checkout/payment');
  },
} satisfies Actions;
