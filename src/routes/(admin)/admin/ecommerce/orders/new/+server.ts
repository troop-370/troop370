import { orderEntrySchema } from '../../ecwidSchemas';
import { createOrder_server } from '../createrOrder_server';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json().then((json) => orderEntrySchema.omit({ id: true }).parse(json));

  return createOrder_server(fetch, body).then((data) => {
    return new Response(JSON.stringify(data));
  });
};
