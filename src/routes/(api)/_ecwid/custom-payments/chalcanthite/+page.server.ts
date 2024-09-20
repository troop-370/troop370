import { ECWID_SECRET_TOKEN, ECWID_STORE_ID } from '$env/static/private';
import { error, redirect } from '@sveltejs/kit';
import { decodeEcwidRequest } from '../decodeEcwidRequest';
import type { PageServerLoad, RequestEvent } from './$types';

export const load = (async () => {
  return {};
}) satisfies PageServerLoad;

export const actions = {
  default: async (event) => {
    try {
      const { locals, request } = event;
      const formData = await request.formData();

      // get the payload from the form data
      const encodedPayload = formData.get('data');

      // if there is no payload, assume it means that the user
      // is submitting the fact that they have completed the payment
      if (!encodedPayload) {
        return handleSubmit(event);
      }

      // decode the payload
      const payload = await decodeEcwidRequest(encodedPayload.toString());

      // send the payload info back to the page
      locals.session.update((session) => {
        session['checkout.venmo.referenceTransactionId'] =
          payload.cart.order.referenceTransactionId;
        session['checkout.venmo.returnUrl'] = payload.returnUrl;
        return session;
      });
      return { payload };
    } catch (err) {
      console.error(err);
      return error(500, 'An error occurred');
    }
  },
};

async function handleSubmit({ locals, request }: RequestEvent) {
  const referenceTransactionId = locals.session.data['checkout.venmo.referenceTransactionId'];
  const returnUrl = locals.session.data['checkout.venmo.returnUrl'];
  if (!referenceTransactionId) {
    return error(400, 'No referenceTransactionId provided');
  }
  if (!returnUrl) {
    return error(400, 'No returnUrl provided');
  }

  await fetch(`https://app.ecwid.com/api/v3/${ECWID_STORE_ID}/orders/${referenceTransactionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ECWID_SECRET_TOKEN}`,
    },
    body: JSON.stringify({
      paymentStatus: 'AWAITING_PAYMENT',
    }),
  });

  // go back to the store
  throw redirect(303, returnUrl);
}
