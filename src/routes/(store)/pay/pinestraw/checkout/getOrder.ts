import { ECWID_SECRET_TOKEN, ECWID_STORE_ID } from '$env/static/private';
import { orderEntrySchema } from '$lib/schemas/ecwidSchemas';

export async function getOrder(plainOrderId: string) {
  return await fetch(`https://app.ecwid.com/api/v3/${ECWID_STORE_ID}/orders/${plainOrderId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${ECWID_SECRET_TOKEN}`,
      'Content-Type': 'application/json',
    },
  })
    .then((res) => res.json())
    .then((json) => {
      return orderEntrySchema.parse(json);
    });
}
