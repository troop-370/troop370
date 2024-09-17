import { redirect } from '@sveltejs/kit';
import { getStoreProfile } from '../../../../../getStoreProfile';
import { updateOrder } from '../../../../../updateOrder';
import type { Actions, PageServerLoad } from './$types';

export const load = (async () => {
  return {};
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request, locals, params }) => {
    const storeProfile = await getStoreProfile();
    const paymentMethod = storeProfile.payment.paymentOptions.find(
      (opt) => opt.id === params.payment_method
    );

    const update = {
      paymentMethod:
        paymentMethod?.paymentProcessorTitle ||
        paymentMethod?.checkoutTitle ||
        locals.session.data['store.pinestraw.checkout.payment_method'],
      paymentModule: paymentMethod?.paymentProcessorId || 'offline',
      paymentStatus: 'AWAITING_PAYMENT',
    };

    await updateOrder(locals.session.data['store.pinestraw.checkout.orderId']!, update, {
      returnUpdatedOrder: true,
    }).then((orderDetails) => {
      const searchParams = new URLSearchParams();
      searchParams.set(
        'payment_method',
        orderDetails.paymentMethod || orderDetails.paymentModule || ''
      );
      searchParams.set('order_id', orderDetails.id);
      searchParams.set('order', JSON.stringify(orderDetails));

      redirect(303, `/pay/pinestraw/thank-you?${searchParams}`);
    });
  },
} satisfies Actions;
