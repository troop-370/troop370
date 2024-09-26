import { ECWID_SECRET_TOKEN, ECWID_STORE_ID } from '$env/static/private';
import { formatISODate, unflatten } from '$utils';
import { toCsv } from '@iwsio/json-csv-core';
import { flatten } from 'flatten-anything';
import type { z } from 'zod';
import { orderEntrySchema, ordersSchema } from '../ecwidSchemas';

type Fetch = typeof fetch;

export async function fetchOrders_server(fetch: Fetch, url: URL) {
  const searchParams = new URLSearchParams();

  // keywords
  if (url.searchParams.has('_search')) {
    searchParams.set('keywords', url.searchParams.get('_search') || '');
  }

  // apply additional filters
  Object.entries(paramsToFilter(url.searchParams)).map(([key, value]) => {
    searchParams.set(key, value);
  });

  // get orders with the applied filters
  const orders = await fetch(
    `https://app.ecwid.com/api/v3/${ECWID_STORE_ID}/orders?${searchParams}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${ECWID_SECRET_TOKEN}`,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => {
      try {
        return ordersSchema.parse(data);
      } catch {
        return { total: 0, count: 0, offset: 0, limit: 100, items: [], error: data };
      }
    });

  return orders;
}

function paramsToFilter(search: URLSearchParams) {
  const result: Record<string, string> = {};
  for (const [key, value] of search.entries()) {
    // each 'entry' is a [key, value] tuple
    if (!key.startsWith('__') && !['_search'].includes(key)) {
      result[key] = value;
    }
  }
  return result;
}

export async function fetchAllOrders_server(fetch: Fetch, url: URL, as: 'array' | 'csv' = 'array') {
  let orders: z.infer<typeof orderEntrySchema>[] = [];
  let totalOrders = 0;

  const getMore = async () => {
    if (orders.length < totalOrders) {
      url.searchParams.set('offset', orders.length.toString());
      await fetchOrders_server(fetch, url)
        .then((data) => {
          orders.push(...data.items);
        })
        .then(() => getMore());
    }
    return;
  };

  await fetchOrders_server(fetch, url).then((data) => {
    orders.push(...data.items);
    totalOrders = data.total;
  });

  await getMore();

  if (as === 'csv') {
    const isPineStraw =
      url.search.includes('148999309') ||
      url.search.includes('149009997') ||
      url.search.includes('696447273') ||
      url.search.includes('696427357');

    let indexWithItem = 0;
    const flatOrders = orders.flatMap(({ id, items, ...rest }, index) => {
      if (isPineStraw) {
        if (items) {
          const pinestrawItem = items.find(
            (d) => d.productId === 149009997 || d.productId === 696447273
          );
          const spreadItem = items.find(
            (d) => d.productId === 148999309 || d.productId === 696427357
          );
          const isShipping = rest.shippingOption?.fulfillmentType === 'SHIPPING';
          const { street, city, stateOrProvinceCode, postalCode } = rest.shippingPerson || {};

          const postOfficeLookup = `https://www.zip-codes.com/search.asp?fld-address=${street}&fld-address2=&fld-city=${city}&fld-state=${stateOrProvinceCode}&fld-zip=${postalCode}&srch-type=address&selectTab=1&Submit=Find+ZIP+Code+of+this+U.S.+Address`;
          const addressLookup = `https://www.google.com/maps/dir/St+James+United+Methodist+Church,+4400+Peachtree+Dunwoody+Rd+NE,+Atlanta,+GA+30342/${street}+${city}+${stateOrProvinceCode}+${postalCode}`;

          const total = rest.usdTotal || 0;
          const paymentProcessorFees =
            rest.usdTotal && rest.paymentMethod === 'PayPal' ? rest.usdTotal * 0.0349 + 0.49 : 0;

          const firstName = (rest.billingPerson?.name || '').split(' ').slice(0, -1).join(' ');
          const lastName = (rest.billingPerson?.name || '').split(' ').slice(-1)[0];

          return {
            '': '',
            'Delivery code': `P-${pinestrawItem?.quantity || 0}${spreadItem ? '-SPREAD-' : ''}${
              spreadItem ? spreadItem?.quantity || 0 : ''
            }`,
            'Full Address': isShipping
              ? street + ', ' + city + ', ' + stateOrProvinceCode + ', ' + postalCode
              : 'PICK UP',
            'Last Name': lastName,
            'First Name': firstName,
            'Date received': rest.createDate ? rest.createDate.toISOString() : '',
            Source: 'store_' + (rest.paymentMethod || 'manual'),
            'Online Store Order No.': id,
            phone: rest.billingPerson?.phone || '',
            email: rest.email || '',
            Address: street || '',
            Zip: postalCode?.slice(0, 5) || '',
            'Lookup postoffice': postOfficeLookup,
            'Zip plus 4 Search': `=HYPERLINK("${postOfficeLookup}", "postoffice")`,
            'Zip plus 4': '',
            Lookup: addressLookup,
            'Map link': `=HYPERLINK("${addressLookup}", "lookup")`,
            Bales: pinestrawItem?.quantity || '',
            'Bales Cost': pinestrawItem?.productPrice
              ? `$ ${pinestrawItem.productPrice.toFixed(2)}`
              : '',
            'Pine Straw Cost': `${
              (pinestrawItem?.quantity || 0) * (pinestrawItem?.productPrice || 0)
            }`,
            'Paypal Cost': paymentProcessorFees ? `$ (${paymentProcessorFees})` : '',
            'Delivery Fee': rest.shippingOption?.shippingRate
              ? `$ ${(rest.shippingOption.shippingRate || 0).toFixed(2)}`
              : '',
            'Spread out NO YES': spreadItem ? 'Yes' : 'NO',
            'Spead out cost per bale': spreadItem?.productPrice
              ? `$ ${spreadItem.productPrice}`
              : '',
            'No. bales spread out': spreadItem?.quantity ? spreadItem.quantity : '',
            '$ spread out':
              spreadItem?.productPrice && spreadItem?.quantity
                ? `$ ${(spreadItem.quantity * spreadItem.productPrice).toFixed(2)}`
                : '',
            Donation: '',
            // total = pine straw revenue + spreading revenue + delivery fee - paypal fees + dontation
            Total: `$ ${total - paymentProcessorFees}`,
            Paid: rest.paymentStatus === 'PAID' ? 'Yes' : 'NO',
            'spread out time': '',
            'Spread out date Instrutions':
              spreadItem?.selectedOptions?.find(
                (opt) =>
                  opt.name ===
                  'Where should the pine straw be spread in your yard? (include the address when checking out)'
              )?.value || '',
            'delivery time': '',
            'Delivery Instructions':
              pinestrawItem?.selectedOptions?.find(
                (opt) =>
                  opt.name ===
                  'Delivery Only: Where should the pine straw bales be placed in your yard?'
              )?.value || '',
            Notes: rest.privateAdminNotes || '',
          };
        }
        return { id };
      }

      if (items) {
        indexWithItem = index;
        return items.map((item) => {
          const { sku, couponApplied, name, price, quantity, selectedOptions, productId } = item;
          return {
            id,
            sku: `${sku} (${productId})`,
            name,
            price,
            quantity,
            options: JSON.stringify(
              (selectedOptions || []).map((opt) => opt.name + ': ' + opt.value)
            ),
            couponApplied,
            ...rest,
          };
        });
      }

      return { id, ...rest };
    });

    return toCsv(
      flatOrders.map((entry) =>
        unflatten(
          Object.fromEntries(
            Object.entries(flatten(entry)).map(([key, value]) => {
              return [key, `${value}`.replaceAll('#', '_')];
            })
          )
        )
      ),
      {
        fields: Object.keys(flatten(flatOrders[indexWithItem])).flatMap((key) => {
          return {
            name: key,
            label: key,
            transform(source) {
              if (JSON.stringify(source) === JSON.stringify('{}')) return '';
              if (JSON.stringify(source) === JSON.stringify('[]')) return '';
              return `${source}`;
            },
          };
        }),
        fieldSeparator: ',',
        ignoreHeader: false,
      }
    );
  }

  return orders;
}
