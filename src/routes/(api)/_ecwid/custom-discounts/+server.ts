import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  return new Response(null, { status: 404 });
};

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.json();
  const paymentMethod = data.cart.paymentMethod;

  return new Response(
    JSON.stringify({
      surcharges: [
        {
          id: 'payment_method_fee',
          value: paymentMethod?.startsWith('PayPal')
            ? 3.5
            : paymentMethod?.startsWith('Venmo')
              ? 1.9
              : 0,
          type: 'PERCENT',
          description: paymentMethod?.startsWith('PayPal')
            ? '+3.5 % for PayPal payments'
            : paymentMethod?.startsWith('Venmo')
              ? '+1.9 % for Venmo payments'
              : '',
          taxable: true,
        },
      ],
    })
  );
};
