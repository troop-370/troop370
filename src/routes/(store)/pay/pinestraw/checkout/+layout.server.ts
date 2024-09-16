import { ECWID_SECRET_TOKEN, ECWID_STORE_ID } from '$env/static/private';
import { calculateOrderSchema, storeProfileSchema } from '$lib/schemas/ecwidSchemas';
import { redirect } from '@sveltejs/kit';
import { fromError } from 'zod-validation-error';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ fetch, parent, locals, url }) => {
  const { products } = await parent();
  if (!products || !products.bale || !products.spread) {
    throw new Error('Products not found');
  }

  const storeProfile = await fetch(`https://app.ecwid.com/api/v3/${ECWID_STORE_ID}/profile`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${ECWID_SECRET_TOKEN}`,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.errorMessage) {
        throw new Error(json.errorMessage);
      }
      return storeProfileSchema.parse(json);
    })
    .catch((error) => {
      const validationError = fromError(error);
      console.error('Failed to fetch store profile', validationError);
      throw validationError;
    });

  const balesQuantity = parseInt(
    locals.session.data['store.pinestraw.checkout.bale_quantity'] || '0'
  );
  const spreadQuantity = parseInt(
    locals.session.data['store.pinestraw.checkout.spread_quantity'] || '0'
  );
  const hasSpreading = spreadQuantity > 0;
  const isOnlySpreading = hasSpreading && balesQuantity === 0;
  const isPickup =
    locals.session.data['store.pinestraw.checkout.shipping_method'] === '12892-1567962734210';

  const paypalPaymentMethodId = storeProfile.payment.paymentOptions.find(
    (option) => option.paymentProcessorTitle === 'PayPalStandard'
  )?.id;
  const PAYPAL_PERCENT_FEE = 3.5;

  const venmoPaymentMethodId = storeProfile.payment.paymentOptions.find(
    (option) => option.checkoutTitle === 'Venmo' && option.paymentProcessorId === 'offline'
  )?.id;
  const VENMO_PERCENT_FEE = 1.9;

  const orderDetails = await fetch(
    `https://app.ecwid.com/api/v3/${ECWID_STORE_ID}/order/calculate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ECWID_SECRET_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // prevent the order from being displayed in the Ecwid control panel
        // (we will set it to false once the order is submitted)
        hidden: true,
        email: locals.session.data['store.pinestraw.checkout.email'],
        shippingPerson: {
          name: locals.session.data['store.pinestraw.checkout.name'],
          phone: locals.session.data['store.pinestraw.checkout.phone'],
          street: locals.session.data['store.pinestraw.checkout.street_address'],
          city: locals.session.data['store.pinestraw.checkout.city'],
          country: 'US',
          stateOrProvinceCode: locals.session.data['store.pinestraw.checkout.state'],
          postalCode: locals.session.data['store.pinestraw.checkout.postal_code'],
        },
        billingPerson: isPickup
          ? {}
          : {
              name: locals.session.data['store.pinestraw.checkout.billing.name'],
              phone: locals.session.data['store.pinestraw.checkout.billing.phone'],
              street: locals.session.data['store.pinestraw.checkout.billing.street_address'],
              city: locals.session.data['store.pinestraw.checkout.billing.city'],
              country: 'US',
              stateOrProvinceCode: locals.session.data['store.pinestraw.checkout.billing.state'],
              postalCode: locals.session.data['store.pinestraw.checkout.billing.postal_code'],
            },
        shippingOption: {
          shippingMethodId: locals.session.data['store.pinestraw.checkout.shipping_method'],
        },
        customSurcharges: [
          {
            value:
              locals.session.data['store.pinestraw.checkout.payment_method'] ===
              venmoPaymentMethodId
                ? VENMO_PERCENT_FEE
                : 0,
            type: 'PERCENT',
            id: 'Venmo fee',
          },
          {
            value:
              locals.session.data['store.pinestraw.checkout.payment_method'] ===
              paypalPaymentMethodId
                ? PAYPAL_PERCENT_FEE
                : 0,
            type: 'PERCENT',
            id: 'PayPal fee',
          },
        ],
        items: [
          {
            productId: products.bale.id,
            categoryId: products.bale.categoryIds?.[0],
            price: products.bale.price,
            weight: products.bale.weight,
            sku: products.bale.sku,
            quantity: balesQuantity,
            name: products.bale.name,
            selectedOptions: [
              {
                name: 'Delivery Only: Where should the pine straw bales be placed in your yard?',
                type: 'TEXT',
                value: locals.session.data['store.pinestraw.checkout.deliver_location'] || '',
              },
            ],
          },
          {
            productId: products.spread.id,
            categoryId: products.spread.categoryIds?.[0],
            price: products.spread.price,
            weight: products.spread.weight,
            sku: products.spread.sku,
            quantity: spreadQuantity,
            name: products.spread.name,
            selectedOptions: [
              {
                name: 'Where should the pine straw be spread in your yard? (include the address when checking out)',
                type: 'TEXT',
                value: locals.session.data['store.pinestraw.checkout.spread_location'] || '',
              },
              {
                name: 'Confirmation (REQUIRED)',
                type: 'CHOICES',
                value: 'I have already ordered or plan to order pine straw from this fundraiser',
                selections: [
                  {
                    selectionModifier: 0,
                    selectionModifierType: 'ABSOLUTE',
                    selectionTitle:
                      'I have already ordered or plan to order pine straw from this fundraiser',
                  },
                ],
              },
            ],
          },
        ],
      }),
    }
  )
    .then((res) => res.json())
    .then((data) => {
      try {
        if (data.errorMessage) {
          throw new Error(data.errorMessage);
        }
        return calculateOrderSchema.parse(data);
      } catch {
        console.error(data);
        throw new Error(data.message || 'Failed to calculate order');
      }
    });

  // await locals.session.update((session) => ({
  //   ...session,
  //   'store.pinestraw.checkout.orderId': undefined,
  // }));

  // if the order has already been created, update the order details
  // so that the order is updated to Ecwid's abonded cart list
  // and we can handle payment data based on the orderId and
  // immediately update it in the Ecwid control panel
  const orderId = locals.session.data['store.pinestraw.checkout.orderId'];
  let hasOrderUpdateError = false;
  if (orderId) {
    // we don't want to update the payment status because it is always 'INCOMPLETE' in `orderDetails`
    const { paymentStatus, ...newOrderDetails } = orderDetails;
    // update the order details
    await fetch(`https://app.ecwid.com/api/v3/${ECWID_STORE_ID}/orders/${orderId}`, {
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
      })
      .catch((error) => {
        console.error(`Error for order ${orderId}`, error);
        hasOrderUpdateError = true;
      });
  }

  // if the order has not been created and we are past the first step,
  // redirect the customer back to the first step
  if (!orderId && url.pathname !== '/pay/pinestraw/checkout') {
    redirect(303, '/pay/pinestraw/checkout');
  }

  // fetch(`https://app.ecwid.com/api/v3/${ECWID_STORE_ID}/orders`, {
  //   method: 'POST',
  //   headers: {
  //     Authorization: `Bearer ${ECWID_SECRET_TOKEN}`,
  //     'Content-Type': 'application/json',
  //     accept: 'application/json',
  //   },
  //   body: JSON.stringify({ ...orderDetails, hidden: true }),
  // })
  //   .then((res) => res.json())
  //   .then(console.log);
  // id: 517874452

  // fetch(`https://app.ecwid.com/api/v3/${ECWID_STORE_ID}/orders/763`, {
  //   method: 'GET',
  //   headers: {
  //     Authorization: `Bearer ${ECWID_SECRET_TOKEN}`,
  //     'Content-Type': 'application/json',
  //     accept: 'application/json',
  //   },
  // })
  //   .then((res) => res.json())
  //   .then(console.log);

  return {
    orderDetails,
    storeProfile,
    paypalPaymentMethodId,
    venmoPaymentMethodId,
    PAYPAL_PERCENT_FEE,
    VENMO_PERCENT_FEE,
    hasOrderUpdateError,
    hasSpreading,
    isOnlySpreading,
    breadcrumbs: [
      { label: 'Store', href: '/pay/pinestraw' },
      { label: 'Checkout', href: '/pay/pinestraw/checkout' },
    ],
    pathname: url.pathname,
  };
}) satisfies LayoutServerLoad;
