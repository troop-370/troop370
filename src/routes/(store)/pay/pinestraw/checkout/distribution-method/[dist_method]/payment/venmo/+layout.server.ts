import type { LayoutServerLoad } from './$types';

export const load = (async ({ parent, params }) => {
  const { breadcrumbs } = await parent();

  return {
    breadcrumbs: [
      ...breadcrumbs,
      {
        label: 'Venmo',
        href: `/pay/pinestraw/checkout/distribution-method/${params.dist_method}/payment/venmo`,
      },
    ],
  };
}) satisfies LayoutServerLoad;
