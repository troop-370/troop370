import { PROTECTED_PAGE_PASSWORD } from '$env/static/private';
import { jwtDecode } from 'jwt-decode';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
  const { counter = 0, protectedPass = '', adminToken } = locals.session.data;

  // if the user has entered the correct password, then they are authenticated
  let authenticated = protectedPass === PROTECTED_PAGE_PASSWORD;

  // alternatively, if the admin panel token is present and not expired, the user is authenticated
  if (!authenticated && adminToken) {
    const tokenExpiresAt = new Date((jwtDecode(adminToken).exp || 0) * 1000);
    const tokenIsExpired = tokenExpiresAt < new Date();

    authenticated = !tokenIsExpired;
  }

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
