import { apity } from '$api';
import { notEmpty } from '$utils';
import type { PageServerLoad } from './$types';

const getHomePageConfig = apity.path("/home-page").method("get").create();

export const load: PageServerLoad = async ({ fetch }) => {
  const { result } = getHomePageConfig(
    {
      populate: "announcement_cards, announcement_cards.background_photo",
    },
    fetch
  );
  const resolved = await result;

  const announcementCards = resolved.ok
    ? resolved?.data?.data?.announcement_cards || []
    : [];

  return {
    announcementCards: [
      new Date() <= new Date("2025-03-15")
        ? {
            id: "1",
            title: "Pine Straw Sale",
            subtitle: "Order by March 15",
            link: "/pay/pinestraw",
            link_text: "Order now",
            background_photo: {
              url: "https://troop370atlanta.org/photos/backgrounds/pineneedles_l.jpg",
            },
          }
        : null,
      ...announcementCards,
    ].filter(notEmpty),
  };
};
