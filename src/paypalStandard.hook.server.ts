import { PAYPAL_BASE_URL, PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } from '$env/static/private';
import { redirect, type Handle } from '@sveltejs/kit';
import { getOrder } from './routes/(store)/pay/pinestraw/checkout/getOrder';
import { updateOrder } from './routes/(store)/pay/pinestraw/checkout/updateOrder';

async function generateAccessToken() {
  // To base64 encode your client id and secret using NodeJs
  const BASE64_ENCODED_CLIENT_ID_AND_SECRET = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);

  const request = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${BASE64_ENCODED_CLIENT_ID_AND_SECRET}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      response_type: 'id_token',
      intent: 'sdk_init',
    }),
  });
  const json = await request.json();
  return json.access_token;
}

async function handleResponse(response: Response) {
  try {
    const jsonResponse = await response.json();
    return {
      jsonResponse,
      httpStatusCode: response.status,
    };
  } catch (err) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
}

/**
 * Create an order to start the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_create
 */
const createOrder = async (storePlainOrderId: string) => {
  const { total } = await getOrder(storePlainOrderId);

  const accessToken = await generateAccessToken();
  const url = `${PAYPAL_BASE_URL}/v2/checkout/orders`;

  const payload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: storePlainOrderId,
        amount: {
          currency_code: 'USD',
          value: total,
        },
      },
    ],
    application_context: {
      shipping_preference: 'NO_SHIPPING', // disables the shipping address fields
    },
  };

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      // Uncomment one of these to force an error for negative testing (in sandbox mode only).
      // Documentation: https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
      // "PayPal-Mock-Response": '{"mock_application_codes": "MISSING_REQUIRED_PARAMETER"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "PERMISSION_DENIED"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
    },
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

/**
 * Capture payment for the created order to complete the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_capture
 */
const captureOrder = async (orderID: string) => {
  const accessToken = await generateAccessToken();
  const url = `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      // Uncomment one of these to force an error for negative testing (in sandbox mode only).
      // Documentation:
      // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
      // "PayPal-Mock-Response": '{"mock_application_codes": "INSTRUMENT_DECLINED"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "TRANSACTION_REFUSED"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
    },
  });

  return handleResponse(response);
};

export default (async function ({ event, resolve }) {
  if (event.url.pathname === '/api/paypal/orders') {
    try {
      // use the cart information passed from the front-end to calculate the order amount detals
      const { storePlainOrderId } = await event.request.json();
      const { jsonResponse, httpStatusCode } = await createOrder(storePlainOrderId);
      return new Response(JSON.stringify(jsonResponse), {
        status: httpStatusCode,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Failed to create order:', error);
      return new Response(JSON.stringify({ error: 'Failed to create order.' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }

  const captureOrderRouteMatch = event.url.pathname.match(
    /^\/api\/paypal\/orders\/(?:([^\/]+?))\/capture\/?$/i
  );
  if (captureOrderRouteMatch) {
    const orderID = captureOrderRouteMatch[1];

    try {
      const { jsonResponse, httpStatusCode } = await captureOrder(orderID);

      // Three cases to handle:
      //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
      //   (2) Other non-recoverable errors -> Show a failure message
      //   (3) Successful transaction -> Show confirmation or thank you message
      const errorDetail = jsonResponse?.details?.[0];
      if (errorDetail) {
        return new Response(JSON.stringify(jsonResponse), {
          status: httpStatusCode,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      // there should be a purchase unit with the amount for the order
      if (!jsonResponse.purchase_units) {
        return new Response(
          JSON.stringify({ details: [{ description: 'There should be a purchase_unit' }] }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      const update = {
        externalTransactionId: jsonResponse.id,
        paymentMessage: jsonResponse.status,
        paymentMethod: 'PayPal',
        paymentModule: 'paypalStandard',
        paymentStatus: jsonResponse.status === 'COMPLETED' ? 'PAID' : 'AWAITING_PAYMENT',
      };

      return await updateOrder(jsonResponse.purchase_units[0].reference_id, update, {
        returnUpdatedOrder: true,
      }).then((orderDetails) => {
        const searchParams = new URLSearchParams();
        searchParams.set(
          'payment_method',
          orderDetails.paymentMethod || orderDetails.paymentModule || ''
        );
        searchParams.set('order_id', orderDetails.id);
        searchParams.set('order', JSON.stringify(orderDetails));

        return new Response(
          JSON.stringify({ thanks: `/pay/pinestraw/thank-you?${searchParams}` }),
          {
            status: httpStatusCode,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      });
    } catch (error) {
      console.error('Failed to capture order:', error);
      return new Response(JSON.stringify({ error: 'Failed to capture order.' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }

  return resolve(event);
} satisfies Handle);
