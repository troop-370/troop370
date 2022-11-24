import { COOKIE_SESSION_SECRET } from '$env/static/private';
import { handleSession } from 'svelte-kit-cookie-session';

export const handle = handleSession(
  { secret: [{ id: 1, secret: COOKIE_SESSION_SECRET }] },
  ({ event, resolve }) => {
    return resolve(event);
  }
);
