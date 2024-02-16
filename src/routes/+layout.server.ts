import { PROTECTED_PAGE_PASSWORD } from '$env/static/private';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
  // handle authentication
  const { counter = 0, protectedPass = '' } = locals.session.data;
  const authenticated = protectedPass === PROTECTED_PAGE_PASSWORD;

  await locals.session.set({
    ...locals.session.data,
    counter: counter + 1,
    authenticated: authenticated,
    authStrings: authenticated
      ? {
          password_message_when_authenticated: `Password: ${PROTECTED_PAGE_PASSWORD}`,
        }
      : {
          password_message_when_authenticated: 'Password: ████████',
        },
  });

  return { session: locals.session.data };
}) satisfies LayoutServerLoad;
