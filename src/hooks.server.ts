import { COOKIE_SESSION_SECRET, STRAPI_URL } from '$env/static/private';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { handleSession } from 'svelte-kit-cookie-session';

const sessionHandler = handleSession(
  { secret: [{ id: 1, secret: COOKIE_SESSION_SECRET }] },
  ({ event, resolve }) => {
    return resolve(event);
  }
);

const adminProxyHandler = (async ({ event, resolve }) => {
  const { fetch, request, locals } = event;

  try {
    if (event.url.pathname.startsWith('/admin/strapi')) {
      // this is the pathname to use for the proxy to the strapi server (remove the prefix path)
      const strapiPathname = event.url.pathname.replace('/admin/strapi', '');

      // get the headers as an object so we can pass them to the strapi server
      const requestHeaders = (() => {
        const headers: Record<string, string> = {};
        for (const [header, value] of request.headers.entries()) {
          headers[header] = value;
        }
        return headers;
      })();

      // parse the request body so that we can pass it to the strapi server
      // (we cannot provided a readable stream to the server via fetch)
      const requestBody = (async () => {
        if (request.method !== 'POST' && request.method !== 'PUT') {
          return undefined;
        }
        if (request.headers.get('Content-Type') === 'application/json') {
          return JSON.stringify(await request.json());
        }
        return request.text();
      })();

      // get the resource from the strapi server
      const cmsAdminUrl = new URL(STRAPI_URL + strapiPathname + event.url.search);
      const cmsAdminRes = await fetch(cmsAdminUrl, {
        headers: { ...requestHeaders },
        method: request.method,
        body: await requestBody,
        cache: request.cache,
        credentials: request.credentials,
        integrity: request.integrity,
        keepalive: request.keepalive,
        mode: request.mode,
        redirect: request.redirect,
        referrer: request.referrer,
        referrerPolicy: request.referrerPolicy,
        signal: request.signal,
        window: null,
      });

      // properly parse the response body from the strapi server
      // so that we can pass it back to the client
      let responseBody = await (async () => {
        if (cmsAdminRes.headers.get('Content-Type')?.includes('application/json')) {
          return JSON.stringify(await cmsAdminRes.json());
        }
        return cmsAdminRes.text();
      })();

      if (
        cmsAdminRes.status === 200 &&
        cmsAdminRes.headers.get('Content-Type')?.startsWith('text/html')
      ) {
        responseBody = responseBody.replace(
          '</head>',
          `<style>
            :root {
              --titlebar-bg: #f3f3f3;
              --content-bg: #ffffff;
            }
            @media (prefers-color-scheme: dark) {
              :root {
                --titlebar-bg: #202020;
                --content-bg: #272727;
              }
            }
            html {
              background-color: var(--titlebar-bg);
              height: 100%;
            }
            html::before, html::after {
              content: '';
              position: fixed;
              top: 0;
              left: 232px;
              background-color: var(--titlebar-bg);
              z-index: 0;
              width: 6px;
              height: 6px;
            }
            html::after {
              background-color: var(--content-bg);
              border-radius: 6px 0 0 0;
            }
            #strapi > div > div > nav { 
              display: none;
            }
            nav[aria-label='Content'], nav[aria-label='Content'] a,
            nav[aria-label='Settings'], nav[aria-label='Settings'] a {
              background-color: var(--titlebar-bg);
              border: none;
            }
            nav[aria-label='Content'] + div,
            nav[aria-label='Settings'] + div,
            div[data-strapi-header-sticky='true'] {
              background-color: var(--content-bg);
              color: var(--color-neutral-light-1400);
              border-radius: 6px 0 0 0;
              border: none;
              overflow: hidden;
            }
            @media (prefers-color-scheme: dark) {
              nav[aria-label='Content'] + div,
              nav[aria-label='Settings'] + div,
              div[data-strapi-header-sticky='true'] {
                color: var(--color-neutral-dark-1400);
              }
            }
            div[data-strapi-header='true'] {
              background: none;
            }
          </style>`
        );
      }

      // pass the response from the strapi server to the client
      return new Response(responseBody, {
        status: cmsAdminRes.status,
        headers: { 'Content-Type': cmsAdminRes.headers.get('Content-Type') || 'text/html' },
      });
    }
  } catch (error) {
    console.error(error);
    return resolve(event);
  }

  return resolve(event);
}) satisfies Handle;

export const handle = sequence(sessionHandler, adminProxyHandler);
