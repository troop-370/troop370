import { ECWID_SECRET_TOKEN, ECWID_STORE_ID } from '$env/static/private';
import { getOrder } from './getOrder';

interface UpdateOrderOptions {
  returnUpdatedOrder?: boolean;
}

export async function updateOrder(
  plainOrderId: string,
  orderDetails: Record<string, unknown>,
  opts: { returnUpdatedOrder: true }
): Promise<Awaited<ReturnType<typeof getOrder>>>;

export async function updateOrder(
  plainOrderId: string,
  orderDetails: Record<string, unknown>,
  opts?: { returnUpdatedOrder?: false }
): Promise<void>;

export async function updateOrder(
  plainOrderId: string,
  orderDetails: Record<string, unknown>,
  opts?: UpdateOrderOptions
): Promise<void | Awaited<ReturnType<typeof getOrder>>> {
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
    .then(async (data) => {
      if (data.errorMessage) {
        throw new Error(data.errorMessage);
      }
      if (opts?.returnUpdatedOrder) {
        return await getOrder(plainOrderId);
      }
    });
}
