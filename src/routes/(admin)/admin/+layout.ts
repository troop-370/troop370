import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { jwtDecode } from 'jwt-decode';
import { z } from 'zod';
import type { LayoutLoad } from './$types';

export const load = (async ({ parent, url, data, fetch, route }) => {
  const { session } = await parent();

  if (url.pathname === '/admin/login') return {};

  if (!session.adminToken) {
    throw redirect(302, `/admin/login?from=${encodeURIComponent(url.href)}`);
  }

  const tokenExpiresAt = new Date((jwtDecode(session.adminToken).exp || 0) * 1000);
  const tokenIsExpired = tokenExpiresAt < new Date();
  if (tokenIsExpired) {
    // we have to manully overwrite the token in the session object
    // because the latest token will not be available until a page refresh
    // unless we manually make it available
    session.adminToken = await fetch('/admin', { method: 'POST' }).then((res) => res.text());
  }

  // ensure that the latest strapi JWT token is available to the strapi app
  if (browser) {
    localStorage.setItem('jwtToken', JSON.stringify(session.adminToken));
    sessionStorage.setItem('jwtToken', JSON.stringify(session.adminToken));
  }

  const contentManagerSettings = fetch('/admin/strapi/content-manager/init', {
    headers: {
      Authorization: `Bearer ${session.adminToken}`,
    },
  })
    .then((res) => res.json())
    .then(({ data }) => {
      return contentManagerInitSchema.parse(data);
    });

  return { contentManagerSettings };
}) satisfies LayoutLoad;

const contentTypeSchema = z
  .object({
    apiID: z.string(),
    uid: z.string(),
    attributes: z.object({}).passthrough(),
    info: z.object({
      description: z.string().optional(),
      displayName: z.string(),
      pluralName: z.string(),
      singularName: z.string(),
      name: z.string().optional(),
    }),
    isDisplayed: z.boolean(),
    kind: z.literal('collectionType').or(z.literal('singleType')),
    options: z.object({}).passthrough().optional(),
    pluginOptions: z.object({}).passthrough().optional(),
  })
  .array();

const contentManagerInitSchema = z.object({
  contentTypes: contentTypeSchema,
});
