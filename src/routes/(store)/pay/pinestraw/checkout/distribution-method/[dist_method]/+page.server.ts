import { redirect } from '@sveltejs/kit';
import validator from 'validator';
import { z } from 'zod';
import { fromError } from 'zod-validation-error';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ parent, locals }) => {
  const { orderDetails } = await parent();

  if (
    !orderDetails.shippingOption ||
    orderDetails.shippingOption.shippingMethodId !==
      locals.session.data?.['store.pinestraw.checkout.shipping_method']
  ) {
    redirect(303, '/pay/pinestraw/checkout/distribution-method');
  }

  const distributionMethod = orderDetails.shippingOption;

  return { distributionMethod };
}) satisfies PageServerLoad;

export const actions = {
  pickup: async ({ request, locals, url }) => {
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

    redirect(303, url.pathname + '/payment');
  },
  delivery: async ({ request, locals, url }) => {
    const data = Object.fromEntries((await request.formData()).entries());

    try {
      z.object({
        name: z.string().nonempty(),
        phone: z.string().refine(validator.isMobilePhone),
        street_address: z.string().nonempty(),
        city: z.string().nonempty(),
        postal_code: z.string().refine((val) => validator.isPostalCode(val, 'US')),
        deliver_location: z.string().nonempty(),
        spread_location: z.string().nonempty().optional(),
        special_instructions: z.string().nonempty().optional(),
      }).parse(data);
    } catch (error) {
      const validationError = fromError(error);
      return { error: validationError.toString(), data };
    }

    await locals.session.update((session) => ({
      ...session,
      'store.pinestraw.checkout.name': data.name.toString(),
      'store.pinestraw.checkout.phone': data.phone.toString(),
      'store.pinestraw.checkout.street_address': data.street_address.toString(),
      'store.pinestraw.checkout.city': data.city.toString(),
      'store.pinestraw.checkout.postal_code': data.postal_code.toString(),
      'store.pinestraw.checkout.deliver_location': data.deliver_location.toString(),
      'store.pinestraw.checkout.spread_location': data.spread_location?.toString(),
      'store.pinestraw.checkout.special_instructions': data.special_instructions?.toString(),
    }));

    redirect(303, url.pathname + '/payment');
  },
} satisfies Actions;
