import { ECWID_SECRET_TOKEN, ECWID_STORE_ID } from '$env/static/private';
import { orderEntrySchema } from '../../ecwidSchemas';
import type { PageServerLoad } from './$types';

export const load = (async ({ fetch, params, depends }) => {
  depends('order-page');

  const order = await fetch(`https://app.ecwid.com/api/v3/${ECWID_STORE_ID}/orders/${params.id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${ECWID_SECRET_TOKEN}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      return orderEntrySchema.parse(data);
    });

  return { order };
}) satisfies PageServerLoad;
