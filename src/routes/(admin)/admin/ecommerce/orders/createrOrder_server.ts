import { ECWID_SECRET_TOKEN, ECWID_STORE_ID } from '$env/static/private';
import { hasKey } from '$utils';
import type { z } from 'zod';
import { createStatusSchema, orderEntrySchema } from '../ecwidSchemas';

type Fetch = typeof fetch;

export async function createOrder_server(fetch: Fetch, order: z.infer<typeof orderParamSchema>) {
  const createdOrder = await fetch(`https://app.ecwid.com/api/v3/${ECWID_STORE_ID}/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ECWID_SECRET_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(order),
  })
    .then((res) => {
      try {
        return res.json();
      } catch (err) {
        if (res.status === 200 && hasKey(err, 'message')) throw new Error(`${err.message}`);
        else throw new Error('Order create error: ' + res.status + ' ' + res.statusText);
      }
    })
    .then((data) => {
      if (data.errorCode) {
        throw new Error('Order create error: ' + data.errorMessage);
      }
      return createStatusSchema.parse(data);
    });

  return createdOrder;
}

const orderParamSchema = orderEntrySchema.omit({ id: true });
