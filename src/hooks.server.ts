import { COOKIE_SESSION_SECRET } from '$env/static/private';
import { sequence } from '@sveltejs/kit/hooks';
import { handleSession } from 'svelte-kit-cookie-session';

const sessionHandler = handleSession(
  { secret: [{ id: 1, secret: COOKIE_SESSION_SECRET }] },
  ({ event, resolve }) => {
    return resolve(event);
  }
);

export const handle = sequence(sessionHandler);
