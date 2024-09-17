import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async () => {
  return {};
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request, locals, params }) => {
    redirect(
      303,
      `/pay/pinestraw/thank-you?payment_method=${params.payment_method}&order_id=${locals.session.data['store.pinestraw.checkout.orderId']}`
    );
  },
} satisfies Actions;
