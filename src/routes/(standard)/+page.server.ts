import { apity } from '$api';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const getHomePageConfig = apity.path('/home-page').method('get').create();

export const load: PageServerLoad = async () => {
  const { result } = getHomePageConfig(
    { populate: 'announcement_cards, announcement_cards.background_photo' },
    fetch
  );
  const resolved = await result;

  if (!resolved.ok) throw error(resolved.status, 'server error');
  if (!resolved.data.data?.attributes) throw error(404, 'not found');

  const announcementCards = resolved.data.data.attributes.announcement_cards;

  return {
    announcementCards,
  };
};
