import { apity } from '$api';
import { PROTECTED_PAGE_PASSWORD } from '$env/static/private';
import { notEmpty, parseDoc } from '$utils';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$houdini';

const getRedirects = apity.path('/redirects').method('get').create();

export const load: LayoutServerLoad = async ({ locals }) => {
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

  // get the redirects
  const { result } = getRedirects({}, fetch);
  const resolved = await result;
  if (!resolved.ok) throw error(resolved.status, 'server error');
  if (!resolved.data.data || resolved.data.data.length < 1) throw error(404, 'not found');
  const redirects = resolved.data.data
    .map(parseDoc)
    .filter(notEmpty)
    .map((doc) => {
      return { from: doc.from, to: doc.to, code: 307 };
    });

  return {
    session: locals.session.data,
    redirects,
  };
};

export interface AuthStrings {
  password_message_when_authenticated: string;
}

export interface Redirect {
  from: string;
  to: string;
  code: number;
}
