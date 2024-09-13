import { ECWID_SECRET_TOKEN, ECWID_STORE_ID } from '$env/static/private';
import { calculateOrderSchema } from '$lib/schemas/ecwidSchemas';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ fetch, parent, locals }) => {
  const { products } = await parent();
  if (!products || !products.bale || !products.spread) {
    throw new Error('Products not found');
  }

  const balesQuantity = parseInt(
    locals.session.data['store.pinestraw.checkout.bale_quantity'] || '0'
  );
  const isPickup =
    locals.session.data['store.pinestraw.checkout.shipping_method'] === '12892-1567962734210';

  const orderDetails = await fetch(
    `https://app.ecwid.com/api/v3/${ECWID_STORE_ID}/order/calculate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ECWID_SECRET_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: locals.session.data['store.pinestraw.checkout.email'],
        billingPerson: {
          name: locals.session.data['store.pinestraw.checkout.name'],
          phone: locals.session.data['store.pinestraw.checkout.phone'],
          street: locals.session.data['store.pinestraw.checkout.street_address'],
          city: locals.session.data['store.pinestraw.checkout.city'],
          country: 'US',
          stateOrProvinceCode: 'GA',
          postalCode: locals.session.data['store.pinestraw.checkout.postal_code'],
        },
        shippingOption: {
          shippingMethodId: locals.session.data['store.pinestraw.checkout.shipping_method'],
        },
        // customSurcharges: [
        //   {
        //     value: 50,
        //     type: 'PERCENT',
        //   },
        // ],
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
            quantity: parseInt(
              locals.session.data['store.pinestraw.checkout.spread_quantity'] || '0'
            ),
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

  // fetch(`https://app.ecwid.com/api/v3/${ECWID_STORE_ID}/orders/517874452`, {
  //   method: 'GET',
  //   headers: {
  //     Authorization: `Bearer ${ECWID_SECRET_TOKEN}`,
  //     'Content-Type': 'application/json',
  //     accept: 'application/json',
  //   },
  // })
  //   .then((res) => res.json())
  //   .then(console.log);

  return { orderDetails };
}) satisfies LayoutServerLoad;
