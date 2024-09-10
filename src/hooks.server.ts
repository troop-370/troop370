import { COOKIE_SESSION_SECRET, STRAPI_URL } from '$env/static/private';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { handleSession } from 'svelte-kit-cookie-session';

const sessionHandler = handleSession(
  { secret: [{ id: 1, secret: COOKIE_SESSION_SECRET, chunked: true }] },
  ({ event, resolve }) => {
    return resolve(event);
  }
);

const adminProxyHandler = (async ({ event, resolve }) => {
  const { fetch, request, locals } = event;

  try {
    if (event.url.pathname.startsWith('/strapi')) {
      // this is the pathname to use for the proxy to the strapi server (remove the prefix path)
      const strapiPathname = event.url.pathname.replace('/strapi', '');

      // if the user is trying to access the strapi admin panel, redirect them to the dashboard page
      if (strapiPathname === '/poptart') {
        return Response.redirect(event.url.origin + '/poptart', 302);
      }

      // get the headers as an object so we can pass them to the strapi server
      const requestHeaders = await (async () => {
        const headers: Record<string, string> = {};
        for (const [header, value] of request.headers.entries()) {
          // An error similar to this one from nextjs was occuring
          // https://github.com/vercel/next.js/issues/48214
          // and the solution is to remove the tranfer-encoding
          // header when making POST requests so that fetch
          // does not fail.
          if (request.method === 'POST' && header.toLowerCase() === 'transfer-encoding') continue;

          headers[header] = value;
        }
        return headers;
      })();

      // get the resource from the strapi server
      const cmsAdminUrl = new URL(STRAPI_URL + strapiPathname + event.url.search);
      const cmsAdminRes = await fetch(cmsAdminUrl, {
        headers: { ...requestHeaders },
        method: request.method,
        body:
          request.method === 'GET' || request.method === 'HEAD' ? null : await event.request.blob(),
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
              color-scheme: light dark;
              --titlebar-bg: #f3f3f3;
              --content-bg: #ffffff;
            }
            @media (prefers-color-scheme: dark) {
              :root {
                --titlebar-bg: #202020;
                --content-bg: #272727;
              }
            }
            html, body {
              background-color: transparent !important;
              height: 100%;
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
            div[data-strapi-header-sticky='true'],
            #strapi > div:has(#main-content) {
              background-color: var(--content-bg);
              color: var(--color-neutral-light-1400);
              border-radius: 6px 0 0 0;
              border: none;
              overflow: hidden;
            }
            #strapi > div:has(#main-content) {
              height: 100%;
              overflow: auto;
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

            /* hide content manager side nav */
            :has(> nav[aria-label='Content']) {
              grid-template-columns: 1fr;
            }
            nav[aria-label='Content'] {
              display: none;
            }

            /* hide strapi-provider spinner */
            div[data-testid="loader"] {
              display: none;
            }

            /* hide back button provided by strapi */
            div:has(> a svg path[d="M24 13.3a.2.2 0 0 1-.2.2H5.74l8.239 8.239a.2.2 0 0 1 0 .282L12.14 23.86a.2.2 0 0 1-.282 0L.14 12.14a.2.2 0 0 1 0-.282L11.86.14a.2.2 0 0 1 .282 0L13.98 1.98a.2.2 0 0 1 0 .282L5.74 10.5H23.8c.11 0 .2.09.2.2v2.6Z"]) {
              display: none;
            }

            /* hide help button */
            aside:has(> button path[d="M5.08 4.1c0-1.19 1.18-2.17 2.42-2.17s2.43.98 2.43 2.17c0 1.1-.56 1.61-1.31 2.28l-.03.03c-.75.65-1.66 1.47-1.66 3.09a.57.57 0 1 0 1.15 0c0-1.08.55-1.6 1.3-2.26l.02-.02c.75-.66 1.67-1.48 1.67-3.12C11.07 2.13 9.22.78 7.5.78 5.78.78 3.93 2.13 3.93 4.1a.57.57 0 1 0 1.15 0Zm2.42 9.26a.88.88 0 1 0 0-1.75.88.88 0 0 0 0 1.75Z"]) {
              display: none;
            }

            /* hide register page logo */
            .sc-bdvvtL.sc-jlsrNB.gCrDBG.bHCmnc img {
              display: none !important;
            }

            /* hide register page keep me updated checkbox */
            .sc-bdvvtL.sc-jlsrNB.gCrDBG.bHCmnc form > main > div > div:last-of-type {
              display: none !important;
            }

            /* change register page heading */
            .sc-bdvvtL.sc-jlsrNB.gCrDBG.bHCmnc h1 {
              font-size: 0;
            }
            .sc-bdvvtL.sc-jlsrNB.gCrDBG.bHCmnc h1::after {
              content: 'Register your Troop 370 Admin account';
              font-size: 1.5rem;
            }

            /* change register page caption */
            .sc-bdvvtL.sc-jlsrNB.gCrDBG.bHCmnc h1 + span {
              font-size: 0;
            }
            .sc-bdvvtL.sc-jlsrNB.gCrDBG.bHCmnc h1 + span::after {
              content: 'If you need help, contact the Webmaster.';
              font-size: 1rem;
            }
          </style>`
        );
      }

      // whenever the strapi app requests a renewal token, we should update that in the session data
      if (cmsAdminRes.status === 200 && cmsAdminUrl.pathname === '/poptart/renew-token') {
        await locals.session.set({
          ...locals.session.data,
          adminToken: JSON.parse(responseBody)?.data?.token,
        });
      }

      // pass the response from the strapi server to the client
      return new Response(responseBody, {
        status: cmsAdminRes.status,
        headers: { 'Content-Type': cmsAdminRes.headers.get('Content-Type') || 'text/html' },
      });
    }
  } catch (error) {
    console.error('Error with Strapi proxy:', error);
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(null, { status: 500 });
  }

  return resolve(event);
}) satisfies Handle;

export const handle = sequence(sessionHandler, adminProxyHandler);
