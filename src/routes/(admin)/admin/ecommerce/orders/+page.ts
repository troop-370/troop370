import { derived, get, writable } from 'svelte/store';
import type { z } from 'zod';
import { ordersSchema } from '../ecwidSchemas';
import type { PageLoad } from './$types';

const ordersInit = {
  total: 0,
  count: 0,
  offset: 0,
  limit: 100,
  items: [],
  loading: false,
};

type OrderData = z.infer<typeof ordersSchema> & { loading: boolean };

const orders = writable<Record<string, OrderData>>({});

export const load = (async ({ fetch, url, depends }) => {
  depends('order-table');

  orders.set({
    ...get(orders),
    [url.search]: { ...(get(orders)[url.search] || ordersInit), loading: true },
  });

  fetch(url)
    .then((res) => res.json())
    .then((json) => ordersSchema.parse(json))
    .then((data) => {
      orders.set({ ...get(orders), [url.search]: { ...data, loading: false } });
    });

  const thisOrder = {
    set: (update: OrderData) => {
      orders.set({ ...get(orders), [url.search]: { ...update } });
    },
    update: (updater: (current: OrderData) => OrderData) => {
      const update = updater(get(orders)[url.search]);
      orders.set({ ...get(orders), [url.search]: { ...update } });
    },
    subscribe: derived([orders], ([$orders]) => {
      return $orders[url.search] || ordersInit;
    }).subscribe,
  };

  return {
    orders: thisOrder,
    url,
  };
}) satisfies PageLoad;
