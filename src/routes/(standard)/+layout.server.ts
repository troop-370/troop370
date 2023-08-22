import { PROTECTED_PAGE_PASSWORD } from '$env/static/private';
import type { LayoutServerLoad } from './$houdini';

export const load: LayoutServerLoad = async ({ locals }) => {
  const { counter = 0, protectedPass = '' } = locals.session.data;
  const authenticated = protectedPass === PROTECTED_PAGE_PASSWORD

  await locals.session.set({
    ...locals.session.data,
    counter: counter + 1,
    authenticated: authenticated,
    authStrings: (authenticated ? {
      password_message_when_authenticated: `Password: ${PROTECTED_PAGE_PASSWORD}`
    } : {
      password_message_when_authenticated: 'Password: ████████'
    }) satisfies AuthStrings
  });

  return {
    session: locals.session.data,
  };
};

export interface AuthStrings {
  password_message_when_authenticated: string;
}