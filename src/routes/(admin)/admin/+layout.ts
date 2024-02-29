import { browser } from '$app/environment';
import { error, redirect } from '@sveltejs/kit';
import { jwtDecode } from 'jwt-decode';
import { z } from 'zod';
import type { LayoutLoad } from './$types';

export const load = (async ({ parent, url, fetch }) => {
  const { session } = await parent();
  const userRoles = session.adminUser?.roles?.map((role) => role.name);

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

  const contentManagerSettings = await fetch('/admin/strapi/content-manager/init', {
    headers: {
      Authorization: `Bearer ${session.adminToken}`,
    },
  })
    .then((res) => res.json())
    .then(({ data, error }) => {
      if (error?.status === 401) return new Error('401');
      return contentManagerInitSchema.parse(data);
    })
    .catch((err) => {
      console.error(err);
      return new Error('failed to get content manager settings');
    });
  if (contentManagerSettings instanceof Error) {
    if (contentManagerSettings.message === '401') {
      throw redirect(302, '/admin/login');
    }
    throw error(500, contentManagerSettings.message);
  }

  const userPermissions = await fetch('/admin/strapi/admin/users/me/permissions', {
    headers: {
      Authorization: `Bearer ${session.adminToken}`,
    },
  })
    .then((res) => res.json())
    .then(({ data }) => {
      return userPermissionsSchema.parse(data);
    })
    .catch((err) => {
      console.error(err);
      return [];
    });

  const permissions = {
    raw: userPermissions,
    contentManager: {
      read: (() => {
        const permissions = userPermissions.filter(
          ({ action }) => action === 'plugin::content-manager.explorer.read'
        );
        return { uids: permissions.map((p) => p.subject), specs: permissions };
      })(),
    },
    uploads: {
      read: !!userPermissions.find((p) => p.action.startsWith('plugin::upload.read')),
    },
  };

  const cmsContentTypes = contentManagerSettings?.contentTypes
    .filter((type) => permissions?.contentManager.read.uids.includes(type.uid))
    .filter((type) => type.isDisplayed)
    .sort((a, b) =>
      a.info.displayName
        .split('::')
        .slice(-1)[0]
        .localeCompare(b.info.displayName.split('::').slice(-1)[0])
    );

  const apps = [
    {
      label: 'Content manager',
      icon: 'ContentView32Regular',
      disabled: !cmsContentTypes || cmsContentTypes.length === 0,
      href: (() => {
        if (cmsContentTypes?.[0]) {
          return `/admin/cms/collection/api::post.post?__pageTitle=Unpublished%20posts&publishedAt={"$null":true}`;
        }
        return '/admin/content-manager';
      })(),
      selected: (url: URL) =>
        url.pathname.startsWith('/admin/content-manager') || url.pathname.startsWith('/admin/cms'),
    },
    {
      label: 'Media library',
      icon: 'Folder24Regular',
      disabled: !permissions.uploads.read,
      href: '/admin/plugins/upload',
      selected: (url: URL) => url.pathname.startsWith('/admin/plugins/upload'),
    },
    {
      label: 'Store orders',
      icon: 'ShoppingBag24Regular',
      disabled: !(userRoles?.includes('Super Admin') || userRoles?.includes('Store Manager')),
      href: '/admin/ecommerce/orders',
      selected: (url: URL) => url.pathname.startsWith('/admin/ecommerce/orders'),
    },
    {
      label: 'Administration',
      icon: 'Options24Regular',
      href: '/admin/settings',
      selected: (url: URL) => url.pathname.startsWith('/admin/settings'),
    },
  ];

  return {
    contentManagerSettings,
    userPermissions: permissions,
    cmsContentTypes,
    apps,
  };
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

const userPermissionsSchema = z
  .object({
    id: z.number(),
    subject: z.string().nullable(),
    action: z.string(),
    actionParameters: z.object({}).nullable(),
    conditions: z.string().array(),
    properties: z.object({
      fields: z.string().array().nullish(),
    }),
  })
  .array();
