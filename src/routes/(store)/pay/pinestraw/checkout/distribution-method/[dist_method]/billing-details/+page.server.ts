import { redirect } from '@sveltejs/kit';
import validator from 'validator';
import { z } from 'zod';
import { fromError } from 'zod-validation-error';
import type { Actions, PageServerLoad } from './$types';

export const load = (async () => {
  return {};
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request, locals, url }) => {
    const data = Object.fromEntries((await request.formData()).entries());

    try {
      z.object({
        name: z.string().nonempty(),
        phone: z.string().refine(validator.isMobilePhone),
        street_address: z.string().nonempty(),
        city: z.string().nonempty(),
        postal_code: z.string().refine((val) => validator.isPostalCode(val, 'US')),
        state: z.string().nonempty(),
      }).parse(data);
    } catch (error) {
      const validationError = fromError(error);
      return { error: validationError.toString(), data };
    }

    await locals.session.update((session) => ({
      ...session,
      'store.pinestraw.checkout.billing.name': data.name.toString(),
      'store.pinestraw.checkout.billing.phone': data.phone.toString(),
      'store.pinestraw.checkout.billing.street_address': data.street_address.toString(),
      'store.pinestraw.checkout.billing.city': data.city.toString(),
      'store.pinestraw.checkout.billing.postal_code': data.postal_code.toString(),
      'store.pinestraw.checkout.billing.state': data.state.toString(),
    }));

    redirect(303, url.pathname + '/payment');
  },
} satisfies Actions;
