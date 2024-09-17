import { ECWID_SECRET_TOKEN, ECWID_STORE_ID } from '$env/static/private';
import { createOrderSchema } from '$lib/schemas/ecwidSchemas';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async () => {
  return {};
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request, locals }) => {
    const data = await request.formData();

    const email = data.get('email')?.toString();
    if (!email) {
      return { error: 'Email is required' };
    }

    await locals.session.update((session) => ({
      ...session,
      'store.pinestraw.checkout.email': email,
    }));

    // create the order
    if (locals.session.data['store.pinestraw.checkout.orderId']) {
      throw redirect(303, '/pay/pinestraw/checkout/distribution-method');
    }
    return fetch(`https://app.ecwid.com/api/v3/${ECWID_STORE_ID}/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ECWID_SECRET_TOKEN}`,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        // set hidden to true to prevent the order from being displayed in the Ecwid control panel
        // (it may appear as an abondoned cart)
        hidden: true,
        paymentStatus: 'INCOMPLETE',
        // we will add the rest of the order details in the distribution-method server layout
        // and update the details whenever the user loads subsequent steps as well
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.errorCode) throw new Error(json.errorMessage || json.errorCode);
        return createOrderSchema.parse(json);
      })
      .then((data) => data.orderId)
      .then(async (id) => {
        await locals.session.update((session) => ({
          ...session,
          'store.pinestraw.checkout.orderId': `${id}`,
        }));
      })
      .catch((error) => {
        console.error(error);
        return {
          error:
            'We are having issues when trying to create your order. Please contact pinestraw@troop370atlanta.org for assistance.',
        };
      })
      .then(() => {
        throw redirect(303, '/pay/pinestraw/checkout/distribution-method');
      });
  },
} satisfies Actions;
