import { get, writable } from 'svelte/store';
import type { z } from 'zod';
import { ordersSchema } from '../ecwidSchemas';
import type { PageLoad } from './$types';

const orders = writable<z.infer<typeof ordersSchema> & { loading: boolean }>({
  total: 0,
  count: 0,
  offset: 0,
  limit: 100,
  items: [],
  loading: false,
});

export const load = (async ({ fetch, url, depends }) => {
  depends('order-table');

  orders.set({ ...get(orders), loading: true });

  fetch(url)
    .then((res) => res.json())
    .then((json) => ordersSchema.parse(json))
    .then((data) => {
      orders.set({ ...data, loading: false });
    });

  return { orders };
}) satisfies PageLoad;
