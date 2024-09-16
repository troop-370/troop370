import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ parent, url, locals }) => {
  const { breadcrumbs, hasSpreading, orderDetails } = await parent();

  // if ordering spreading, direct to the delivery page
  // because it has the question about where to spread
  // and it is not possible to pick up spreading service
  const deliveryMethodId = orderDetails.availableShippingOptions?.find(
    (detail) => detail.shippingMethodName === 'Delivery'
  )?.shippingMethodId;
  if (
    hasSpreading &&
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
    breadcrumbs: hasSpreading
      ? breadcrumbs
      : [
          ...breadcrumbs,
          { label: 'Distribution', href: '/pay/pinestraw/checkout/distribution-method' },
        ],
  };
}) satisfies LayoutServerLoad;
