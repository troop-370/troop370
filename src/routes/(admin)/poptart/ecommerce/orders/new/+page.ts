import { goto } from '$app/navigation';
import { PUBLIC_ECWID_STORE_ID, PUBLIC_ECWID_TOKEN } from '$env/static/public';
import { hasKey } from '$utils';
import { queryWithStore } from '$utils/query';
import { z } from 'zod';
import { createStatusSchema, productSchema } from '../../ecwidSchemas';
import type { PageLoad } from './$types';

export const load = (async ({ fetch }) => {
  const productsStore = queryWithStore<z.infer<typeof productSchema>[]>({
    fetch,
    query: {
      location: `https://app.ecwid.com/api/v3/${PUBLIC_ECWID_STORE_ID}/products`,
      opName: 'ecwidProducts',
      docsPath: 'items',
      paginationPath: '',
    },
    validator: productSchema.array(),
    credentials: 'omit',
    Authorization: `Bearer ${PUBLIC_ECWID_TOKEN}`,
  });

  const shippingOptionsStore = queryWithStore<z.infer<typeof shippingOptionsSchema>>({
    fetch,
    query: {
      location: `https://app.ecwid.com/api/v3/${PUBLIC_ECWID_STORE_ID}/profile/shippingOptions`,
      opName: 'ecwidShippingOptions',
      docsPath: '',
      paginationPath: '',
    },
    validator: z
      .object({
        id: z.string(),
        fulfilmentType: z.string(),
        title: z.string(),
        enabled: z.boolean(),
      })
      .array(),
    credentials: 'omit',
    Authorization: `Bearer ${PUBLIC_ECWID_TOKEN}`,
  });

  async function calculateOrderDetails(payload: {}) {
    const orderDetails = await fetch(
      `https://app.ecwid.com/api/v3/${PUBLIC_ECWID_STORE_ID}/order/calculate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PUBLIC_ECWID_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    ).then((res) => res.json());
    // .then((data) => {
    //   return orderEntrySchema.parse(data);
    // });

    console.log(payload.privateAdminNotes);

    const order = await fetch('', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PUBLIC_ECWID_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...orderDetails,
        privateAdminNotes: hasKey(payload, 'privateAdminNotes')
          ? payload.privateAdminNotes
          : undefined,
      }),
    })
      .then((res) => res.json())
      .then((json) => createStatusSchema.parse(json));

    goto('./' + order.orderId);
  }

  return {
    productsStore: await productsStore,
    shippingOptionsStore: await shippingOptionsStore,
    calculateOrderDetails,
  };
}) satisfies PageLoad;

const shippingOptionsSchema = z
  .object({
    id: z.string(),
    fulfilmentType: z.string(),
    title: z.string(),
    enabled: z.boolean(),
  })
  .array();
