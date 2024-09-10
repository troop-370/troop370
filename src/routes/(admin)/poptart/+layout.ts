import { browser } from '$app/environment';
import { queryWithStore } from '$utils/query';
import { redirect } from '@sveltejs/kit';
import { jwtDecode } from 'jwt-decode';
import { derived, get } from 'svelte/store';
import { z } from 'zod';
import type { LayoutLoad } from './$types';

export const load = (async ({ parent, url, fetch }) => {
  const { session } = await parent();
  const userRoles = session.adminUser?.roles?.map((role) => role.name);

  if (url.pathname === '/poptart/login') return {};

  if (!session.adminToken) {
    redirect(302, `/poptart/login?from=${encodeURIComponent(url.href)}`);
  }

  const tokenExpiresAt = new Date((jwtDecode(session.adminToken).exp || 0) * 1000);
  const tokenIsExpired = tokenExpiresAt < new Date();
  if (tokenIsExpired) {
    // we have to manully overwrite the token in the session object
    // because the latest token will not be available until a page refresh
    // unless we manually make it available
    session.adminToken = await fetch('/poptart', { method: 'POST' }).then((res) => res.text());
  }

  // ensure that the latest strapi JWT token is available to the strapi app
  if (browser) {
    localStorage.setItem('jwtToken', JSON.stringify(session.adminToken));
    sessionStorage.setItem('jwtToken', JSON.stringify(session.adminToken));
  }

  const cmsSettings = await queryWithStore<z.infer<typeof contentManagerInitSchema>>({
    fetch,
    query: {
      location: '/strapi/content-manager/init',
      opName: 'strapiContentManagerInit',
      docsPath: 'data',
      paginationPath: '',
    },
    validator: contentManagerInitSchema,
    Authorization: `Bearer ${session.adminToken}`,
    waitForQuery: true, // ensure that data is available before continuing since we need it in this function
    useCache: true,
    expireCache: 15 * 60 * 1000, // require refetch if it has been 15 minutes
  })
    .then((store) => [store, get(store)] as const)
    .then(([store, $store]) => {
      if ($store.errors?.[0]?.status === 401) {
        redirect(302, '/poptart/login');
      }
      return store;
    });

  const userPermissions = await queryWithStore<z.infer<typeof userPermissionsSchema>>({
    fetch,
    query: {
      location: '/strapi/admin/users/me/permissions',
      opName: 'strapiUserPermissions',
      docsPath: 'data',
      paginationPath: '',
    },
    validator: userPermissionsSchema,
    Authorization: `Bearer ${session.adminToken}`,
    waitForQuery: true, // ensure that data is available before continuing since we need it in this function
    useCache: true,
    expireCache: 15 * 60 * 1000, // require refetch if it has been 15 minutes
  });

  const permissions = derived([userPermissions], ([$userPermissions]) => {
    return {
      raw: $userPermissions.data?.docs || [],
      contentManager: {
        read: (() => {
          const permissions =
            $userPermissions.data?.docs.filter(
              ({ action }) => action === 'plugin::content-manager.explorer.read'
            ) || [];
          return { uids: permissions.map((p) => p.subject), specs: permissions };
        })(),
      },
      uploads: {
        read: !!$userPermissions.data?.docs.find((p) => p.action.startsWith('plugin::upload.read')),
      },
    };
  });

  const cmsContentTypes = derived(
    [cmsSettings, permissions],
    ([$contentManagerSettings, $permissions]) => {
      return (
        $contentManagerSettings?.data?.docs?.contentTypes
          .filter((type) => $permissions.contentManager.read.uids.includes(type.uid))
          .filter((type) => type.isDisplayed)
          .sort((a, b) =>
            a.info.displayName
              .split('::')
              .slice(-1)[0]
              .localeCompare(b.info.displayName.split('::').slice(-1)[0])
          ) || []
      );
    }
  );

  const apps = derived([cmsContentTypes, permissions], ([$cmsContentTypes, $permissions]) => {
    return [
      {
        label: 'Content manager',
        icon: 'ContentView32Regular',
        disabled: !cmsContentTypes || $cmsContentTypes.length === 0,
        href: (() => {
          if ($cmsContentTypes?.[0]) {
            const uids = $cmsContentTypes.map(({ uid }) => uid);
            if (uids.includes('api::post.post')) {
              return `/poptart/cms/collection/api::post.post?__pageTitle=Unpublished%20posts&publishedAt={"$null":true}`;
            } else {
              return `/poptart/cms/collection/${$cmsContentTypes[0].uid}`;
            }
          }
          return '/poptart/content-manager';
        })(),
        selected: (url: URL) =>
          url.pathname.startsWith('/poptart/content-manager') ||
          url.pathname.startsWith('/poptart/cms'),
      },
      {
        label: 'Media library',
        icon: 'Folder24Regular',
        disabled: !$permissions.uploads.read,
        href: '/poptart/plugins/upload',
        selected: (url: URL) => url.pathname.startsWith('/poptart/plugins/upload'),
      },
      {
        label: 'Store orders',
        icon: 'ShoppingBag24Regular',
        disabled: !(userRoles?.includes('Super Admin') || userRoles?.includes('Store Manager')),
        href: '/poptart/ecommerce/orders',
        selected: (url: URL) => url.pathname.startsWith('/poptart/ecommerce'),
      },
      {
        label: 'Vault',
        icon: 'Key24Regular',
        href: '/poptart/vault/logins',
        selected: (url: URL) => url.pathname.startsWith('/poptart/vault'),
      },
      {
        label: 'Administration',
        icon: 'Options24Regular',
        href: '/poptart/settings',
        selected: (url: URL) => url.pathname.startsWith('/poptart/settings'),
      },
    ];
  });

  return {
    contentManagerSettings: cmsSettings,
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
