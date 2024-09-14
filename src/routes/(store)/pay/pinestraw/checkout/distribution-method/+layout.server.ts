import type { LayoutServerLoad } from './$types';

export const load = (async ({ parent, url }) => {
  const { breadcrumbs } = await parent();

  return {
    breadcrumbs: [
      ...breadcrumbs,
      { label: 'Distribution', href: '/pay/pinestraw/checkout/distribution-method' },
    ],
  };
}) satisfies LayoutServerLoad;
