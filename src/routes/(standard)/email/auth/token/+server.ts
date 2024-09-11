import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ url, locals }) => {
  const redirectURL = url.searchParams.get('state') || url.origin;

  const code = url.searchParams.get('access_token');
  const expires_in = parseInt(url.searchParams.get('expires_in') || '7200');
  if (!code) error(500, 'Expected an authorization code');
  await locals.session.set({ ...locals.session.data, ccToken: code || '' });
  await locals.session.set({
    ...locals.session.data,
    ccToken: code,
    ccTokenExpires: new Date(new Date().getTime() + expires_in * 1000),
  });

  return new Response(String(redirectURL));
};
