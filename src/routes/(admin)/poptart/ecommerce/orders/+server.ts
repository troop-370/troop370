import type { RequestHandler } from './$types';
import { fetchAllOrders_server, fetchOrders_server } from './fetchOrders_server';

export const GET: RequestHandler = async ({ url, request }) => {
  if (url.searchParams.get('all') === 'true') {
    const asCsv = url.searchParams.get('as') === 'csv';
    return fetchAllOrders_server(fetch, url, asCsv ? 'csv' : 'array').then((data) => {
      if (typeof data === 'string') {
        return new Response(data, { headers: { 'Content-Type': 'text/csv' } });
      }
      return new Response(JSON.stringify(data));
    });
  }

  return fetchOrders_server(fetch, url).then((data) => {
    return new Response(JSON.stringify(data));
  });
};
