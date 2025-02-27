import { apity } from '$api';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const getEventsPageConfig = apity.path('/events-page').method('get').create();

export const load: PageServerLoad = async () => {
  const { result } = getEventsPageConfig({ populate: 'nav_items.photo' }, fetch);
  const resolved = await result;
  if (!resolved.ok) error(resolved.status, 'server error');
  if (!resolved.data.data) error(404, 'not found');

  const eventCards = resolved.data.data?.nav_items;
  if (!eventCards) error(404, 'items not found');

  return { eventCards };
};
