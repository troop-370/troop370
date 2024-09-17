import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ parent, params }) => {
  const { breadcrumbs, availablePaymentMethods } = await parent();

  const paymentMethod = availablePaymentMethods.find(
    (method) => method.id === params.payment_method
  );
  const isSupportedPaymentMethod = ['offline', 'paypalStandard'].includes(
    paymentMethod?.paymentProcessorId || ''
  );
  if (!paymentMethod || !isSupportedPaymentMethod) {
    throw redirect(
      307,
      `/pay/pinestraw/checkout/distribution-method/${params.dist_method}/payment`
    );
  }

  return {
    breadcrumbs: [
      ...breadcrumbs,
      {
        label: paymentMethod.checkoutTitle,
        href: `/pay/pinestraw/checkout/distribution-method/${params.dist_method}/payment/${params.payment_method}`,
      },
    ],
    paymentMethod,
  };
}) satisfies LayoutServerLoad;
