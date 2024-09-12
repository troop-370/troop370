import { apity } from '$api';
import { ECWID_SECRET_TOKEN, ECWID_STORE_ID } from '$env/static/private';
import { awaited } from '$utils';
import { productsSchema } from '../../../(admin)/admin/ecommerce/ecwidSchemas';
import type { LayoutServerLoad } from './$types';

const getContentPages = apity.path('/pages').method('get').create();

export const load = (async ({ fetch, url }) => {
  const previewId = url.searchParams.get('previewId');

  // get the pine straw page
  const page = await getContentPages(
    {
      filters: { path: '/events/pinestraw', previewId },
      publicationState: previewId ? 'preview' : 'live',
      populate: 'quick_links',
    },
    fetch
  ).result.then((resolved) => {
    if (resolved.ok) {
      return resolved?.data?.data?.[0]?.attributes;
    }
  });

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

  const aboutSectionText = page?.body
    ?.match(/(?<=## About)(.*?)(?=### Upcoming Dates)/is)?.[0]
    ?.trim();

  const datesSectionText = page?.body
    ?.match(/(?<=### Upcoming Dates)(.*?)(?=## Pricing)/is)?.[0]
    ?.trim();
  const [nextDeadlineYear] = datesSectionText?.match(/\d+/g) || [''];
  const nextDeadline =
    datesSectionText
      ?.match(/Order Deadline –(.*)/)?.[1]
      ?.replaceAll('\\', '')
      .trim() + `, ${nextDeadlineYear}`;
  const nextDelivery =
    datesSectionText
      ?.match(/Delivery –(.*)/)?.[1]
      ?.replaceAll('\\', '')
      .trim() + `, ${nextDeadlineYear}`;

  const orderForm = page?.body?.substr(page.body.indexOf('Order Form') + 11);
  const orderFormHref = orderForm?.match(/(?<=\()(.*?)(?=\))/is)?.[0];
  const orderFormNote = orderForm?.slice(2, orderForm.indexOf('.ob]'));

  return await awaited({
    page,
    products,
    aboutSectionText,
    dates: { nextDeadline, nextDelivery },
    orderForm: { href: orderFormHref, note: orderFormNote },
  });
}) satisfies LayoutServerLoad;
