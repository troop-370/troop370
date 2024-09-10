import { ECWID_SECRET_TOKEN, ECWID_STORE_ID } from '$env/static/private';
import { z } from 'zod';
import type { orderEntrySchema } from '../ecwidSchemas';

type Fetch = typeof fetch;

export async function updateOrder_server(fetch: Fetch, order: z.infer<typeof orderEntrySchema>) {
  const updatedOrder = await fetch(
    `https://app.ecwid.com/api/v3/${ECWID_STORE_ID}/orders/${order.id}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${ECWID_SECRET_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    }
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.errorCode) {
        throw new Error('Order update error: ' + data.errorMessage);
      }
      return updateResponse.parse(data);
    });

  return updatedOrder;
}

const updateResponse = z.object({
  updateCount: z.number(),
});
