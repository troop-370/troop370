import { error } from '@sveltejs/kit';
import { orderEntrySchema } from '../../ecwidSchemas';
import { updateOrder_server } from '../updateOrder_server';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ locals, request }) => {
  if (!locals.session.data.adminToken) {
    error(401);
  }

  const body = await request.json().then((json) => orderEntrySchema.parse(json));

  return updateOrder_server(fetch, body).then((data) => {
    return new Response(JSON.stringify(data));
  });
};
