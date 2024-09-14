import type { LayoutServerLoad } from './$types';

export const load = (async ({ parent, locals, params }) => {
  const { orderDetails, breadcrumbs } = await parent();

  return {
    breadcrumbs: [
      ...breadcrumbs,
      {
        label:
          (orderDetails.shippingOption?.isPickup ? 'Pickup' : 'Delivery') || 'Distribution method',
        href: `/pay/pinestraw/checkout/distribution-method/${params.dist_method}`,
      },
    ],
  };
}) satisfies LayoutServerLoad;
