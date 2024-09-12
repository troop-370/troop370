import { apity } from '$api';
import { awaited } from '$utils';
import type { LayoutServerLoad } from './$types';
import { updateBreadcrumbs } from './checkout/updateBreadcrumbs';

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
    aboutSectionText,
    dates: { nextDeadline, nextDelivery },
    orderForm: { href: orderFormHref, note: orderFormNote },
  });
}) satisfies LayoutServerLoad;
