import { ECWID_SECRET_TOKEN, ECWID_STORE_ID } from '$env/static/private';
import { awaited } from '$utils';
import { productsSchema } from '../../../(admin)/admin/ecommerce/ecwidSchemas';
import type { PageServerLoad } from './$types';

export const load = (async ({ fetch, locals }) => {
  await locals.session.update((session) => ({
    ...session,
    'store.pinestraw.checkout.breadcrumbs': [
      { label: 'Home', href: '/' },
      { label: 'Payments' },
      {
        label: 'Pine straw fundraiser',
        href: '/pay/pinestraw',
      },
    ],
  }));

  // get data on pine straw products
  const baleId = 149009997;
  const spreadId = 148999309;
  const products = await fetch(
    `https://app.ecwid.com/api/v3/${ECWID_STORE_ID}/products?productId=${baleId},${spreadId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${ECWID_SECRET_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  )
    .then((res) => res.json())
    .then((data) => {
      try {
        const parsed = productsSchema.parse(data);
        return {
          bale: parsed.items.find((product) => product.id === baleId),
          spread: parsed.items.find((product) => product.id === spreadId),
        };
      } catch {
        console.error(data);
      }
    });

  return await awaited({ products });
}) satisfies PageServerLoad;
