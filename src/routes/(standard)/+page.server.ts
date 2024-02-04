import { apity } from '$api';
import type { PageServerLoad } from './$types';

const getHomePageConfig = apity.path('/home-page').method('get').create();

export const load: PageServerLoad = async () => {
  const { result } = getHomePageConfig(
    { populate: 'announcement_cards, announcement_cards.background_photo' },
    fetch
  );
  const resolved = await result;

  const announcementCards = resolved.ok ? resolved?.data?.data?.attributes?.announcement_cards : [];

  return {
    announcementCards,
  };
};
