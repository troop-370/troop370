import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ parent, url, locals }) => {
  const { breadcrumbs, isOnlySpreading, orderDetails } = await parent();

  // if only ordering spreading, direct to the delivery page
  // because it has the question about where to spread
  const deliveryMethodId = orderDetails.availableShippingOptions?.find(
    (detail) => detail.shippingMethodName === 'Delivery'
  )?.shippingMethodId;
  if (
    isOnlySpreading &&
    deliveryMethodId &&
    url.pathname === '/pay/pinestraw/checkout/distribution-method'
  ) {
    await locals.session.update((session) => {
      return {
        ...session,
        'store.pinestraw.checkout.shipping_method': deliveryMethodId,
      };
    });

    throw redirect(307, `/pay/pinestraw/checkout/distribution-method/${deliveryMethodId}`);
  }

  return {
    breadcrumbs: isOnlySpreading
      ? breadcrumbs
      : [
          ...breadcrumbs,
          { label: 'Distribution', href: '/pay/pinestraw/checkout/distribution-method' },
        ],
  };
}) satisfies LayoutServerLoad;
