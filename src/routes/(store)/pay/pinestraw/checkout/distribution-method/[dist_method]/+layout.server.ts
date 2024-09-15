import type { LayoutServerLoad } from './$types';

export const load = (async ({ parent, locals, params }) => {
  const { orderDetails, breadcrumbs, isOnlySpreading } = await parent();

  return {
    breadcrumbs: [
      ...breadcrumbs,
      {
        label: isOnlySpreading
          ? 'Spreading details'
          : (orderDetails.shippingOption?.isPickup ? 'Pickup' : 'Delivery') ||
            'Distribution method',
        href: `/pay/pinestraw/checkout/distribution-method/${params.dist_method}`,
      },
    ],
  };
}) satisfies LayoutServerLoad;
