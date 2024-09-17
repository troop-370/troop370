import { ECWID_SECRET_TOKEN, ECWID_STORE_ID } from '$env/static/private';

export async function updateOrder(plainOrderId: string, orderDetails: Record<string, unknown>) {
  return await fetch(`https://app.ecwid.com/api/v3/${ECWID_STORE_ID}/orders/${plainOrderId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${ECWID_SECRET_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...orderDetails,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.errorMessage) {
        throw new Error(data.errorMessage);
      }
    });
}
