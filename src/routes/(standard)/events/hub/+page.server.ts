import { apity } from '$api';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const getEventsPageConfig = apity.path('/events-page').method('get').create();

export const load: PageServerLoad = async ({ params, url }) => {
  const previewId = url.searchParams.get('previewId');

  const { result } = getEventsPageConfig({ populate: 'nav_items, nav_items.photo' }, fetch);
  const resolved = await result;
  if (!resolved.ok) throw error(resolved.status, 'server error');
  if (!resolved.data.data) throw error(404, 'not found');

  const eventCards = resolved.data.data.attributes?.nav_items;
  if (!eventCards) throw error(404, 'items not found');

  console.log(eventCards[0].photo?.data?.attributes?.url);

  return { eventCards };
};
