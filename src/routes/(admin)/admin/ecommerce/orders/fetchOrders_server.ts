import { ECWID_SECRET_TOKEN, ECWID_STORE_ID } from '$env/static/private';
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
      return ordersSchema.parse(data);
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
    let indexWithItem = 0;
    const flatOrders = orders.flatMap(({ id, items, ...rest }, index) => {
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

    return toCsv(flatOrders, {
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
    });
  }

  return orders;
}
