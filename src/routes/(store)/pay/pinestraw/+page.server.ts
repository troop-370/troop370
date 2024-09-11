import { apity } from '$api';
import { ECWID_SECRET_TOKEN, ECWID_STORE_ID } from '$env/static/private';
import { awaited } from '$utils';
import { productsSchema } from '../../../(admin)/admin/ecommerce/ecwidSchemas';
import type { PageServerLoad } from './$types';

const getContentPages = apity.path('/pages').method('get').create();

export const load = (async ({ fetch, parent, url }) => {
  const { session } = await parent();
  const previewId = url.searchParams.get('previewId');

  // get the pine straw page
  const page = getContentPages(
    {
      filters: { path: '/events/pinestraw', previewId },
      publicationState: previewId ? 'preview' : 'live',
      populate: 'quick_links',
    },
    fetch
  ).result.then((resolved) => resolved?.data?.data?.[0]?.attributes);

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

  return {
    ...(await awaited({ page, products })),
    authStrings: session.authStrings,
  };
}) satisfies PageServerLoad;
