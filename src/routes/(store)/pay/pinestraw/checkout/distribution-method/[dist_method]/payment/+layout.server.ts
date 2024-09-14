import type { LayoutServerLoad } from './$types';

export const load = (async ({ parent, params, route }) => {
  const { breadcrumbs } = await parent();

  return {
    breadcrumbs: [
      ...breadcrumbs,
      {
        label: 'Payment',
        href: `/pay/pinestraw/checkout/distribution-method/${params.dist_method}/payment`,
      },
    ],
  };
}) satisfies LayoutServerLoad;
