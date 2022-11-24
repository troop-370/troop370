import { PROTECTED_PAGE_PASSWORD } from '$env/static/private';
import type { LayoutServerLoad } from './$houdini';

export const load: LayoutServerLoad = async ({ locals }) => {
  const { counter = 0, protectedPass = '' } = locals.session.data;

  await locals.session.set({
    ...locals.session.data,
    counter: counter + 1,
    authenticated: protectedPass === PROTECTED_PAGE_PASSWORD,
  });

  return {
    session: locals.session.data,
  };
};
