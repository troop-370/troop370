import { CONSTANT_CONTACT_CLIENT_ID } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ url }) => {
    const from = url.searchParams.get('from') || url.origin;
    const to = url.origin + url.pathname + '/token';

    const redirectUrl = createAuthorizationRequest(from, to);
    throw redirect(302, redirectUrl.href);
  },
};

function createAuthorizationRequest(from: string, to: string) {
  const url = new URL('https://authz.constantcontact.com/oauth2/default/v1/authorize');
  url.searchParams.set('client_id', CONSTANT_CONTACT_CLIENT_ID);
  url.searchParams.set('redirect_uri', to);
  url.searchParams.set('response_type', 'token');
  url.searchParams.set('state', from);
  url.searchParams.set('nonce', 'lol');
  url.searchParams.set('scope', 'account_read campaign_data contact_data');

  return url;
}
