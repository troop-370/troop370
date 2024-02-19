<script lang="ts">
  import { page } from '$app/stores';
  import NavigationView from '$components/admin/NavigationView.svelte';
  import type { MenuItem } from '$components/admin/NavigationView/_NavigationTypes.js';
  import Ribbon from '$components/admin/Ribbon.svelte';
  import Titlebar from '$components/admin/Titlebar.svelte';
  import { collapsedPane, collapsedPaneCompact } from '$stores/collapsedPane';
  import { compactMode } from '$stores/compactMode';
  import { afterUpdate } from 'svelte';

  export let data;

  // keep track of the page path
  export let path: string = $page.url.pathname;
  afterUpdate(() => {
    // keep the path updated when the component changes
    path = $page.url.pathname;
  });

  $: mainMenuItems = [
    {
      label: 'Troop 370 Home',
      icon: 'Home16Regular',
      href: `/`,
    },
    {
      label: 'Apps',
      icon: 'Apps16Regular',
      type: 'expander',
      children: [
        {
          label: 'Content manager',
          icon: 'ContentView32Regular',
          href: (() => {
            if (cmsContentTypes?.[0]) {
              return `/admin/content-manager/collection-types/${cmsContentTypes[0].uid}`;
            }
            return '/admin/content-manager';
          })(),
          selected: $page.url.pathname.startsWith('/admin/content-manager'),
        },
        {
          label: 'Media library',
          icon: 'Folder24Regular',
          href: '/admin/plugins/upload',
          selected: $page.url.pathname.startsWith('/admin/plugins/upload'),
        },
        {
          label: 'Administration',
          icon: 'Options24Regular',
          href: '/admin/settings',
          selected: $page.url.pathname.startsWith('/admin/settings'),
        },
      ],
    },
  ];

  $: cmsContentTypes = data.contentManagerSettings?.contentTypes
    .filter((type) => data.userPermissions?.contentManager.read.uids.includes(type.uid))
    .filter((type) => type.isDisplayed)
    .sort((a, b) => a.info.displayName.localeCompare(b.info.displayName));

  $: routeMenuItems = $page.url.pathname.startsWith('/admin/content-manager')
    ? [
        {
          label: 'hr',
        },
        {
          type: 'category',
          label: 'Collections',
        },
        ...(cmsContentTypes
          ?.filter((type) => type.kind === 'collectionType')
          .map((type) => {
            const pathname = `/admin/content-manager/collection-types/${type.uid}`;
            return {
              label: type.info.displayName,
              icon: 'CircleSmall20Filled',
              href: pathname,
              selected: $page.url.pathname.startsWith(pathname),
            };
          }) || []),
        {
          type: 'category',
          label: 'Single types',
        },
        ...(cmsContentTypes
          ?.filter((type) => type.kind === 'singleType')
          .map((type) => {
            const pathname = `/admin/content-manager/single-types/${type.uid}`;
            return {
              label: type.info.displayName,
              icon: 'CircleSmall20Filled',
              href: pathname,
              selected: $page.url.pathname.startsWith(pathname),
            };
          }) || []),
      ]
    : [];

  let windowWidth = 1000;
  $: navPaneCompactMode = windowWidth < 900;
</script>

<svelte:head>
  <title>Troop 370 Admin</title>
  <link rel="manifest" href="/admin/manifest.webmanifest" />
</svelte:head>

<svelte:window bind:innerWidth={windowWidth} />

{#if !['/admin/login'].includes(path)}
  <div id="admin">
    <div id="admin-header">
      <Titlebar {data} />
      <!-- <Ribbon /> -->
    </div>

    <div id="admin-app">
      <div id="admin-sidebar">
        {#if navPaneCompactMode}
          <NavigationView
            variant="leftCompact"
            menuItems={[...mainMenuItems, ...routeMenuItems]}
            showBackArrow={false}
            compact={$compactMode}
            bind:collapsedPane={$collapsedPaneCompact}
          />
        {:else}
          <NavigationView
            variant="left"
            menuItems={[...mainMenuItems, ...routeMenuItems]}
            showBackArrow
            compact={$compactMode}
            bind:collapsedPane={$collapsedPane}
          />
        {/if}
      </div>

      <div id="admin-content-outer">
        <div id="admin-content">
          <slot />
        </div>
      </div>
    </div>
  </div>
{:else}
  <slot />
{/if}

<div>
  <style>
    :root {
      color-scheme: light dark;
    }
  </style>
</div>

<style>
  #admin {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    position: fixed;
    color: var(--color-neutral-light-1400);
  }
  @media (prefers-color-scheme: dark) {
    #admin {
      color: var(--color-neutral-dark-1400);
    }
  }

  #admin-header {
    box-sizing: border-box;
    grid-area: header;
    background-color: var(--titlebar-bg);
  }

  #admin-app {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 0;
    flex-grow: 1;
    flex-shrink: 1;
    background-color: var(--titlebar-bg);
  }

  #admin-sidebar {
    box-sizing: border-box;
    grid-area: sidebar;
    flex-grow: 0;
    flex-shrink: 0;
  }

  #admin-content-outer {
    overflow: hidden;
    width: 100%;
    height: 100%;
    /* display: flex;
    flex-direction: column; */
    background-color: var(--content-bg);
    border-radius: 6px 0 0 0;
    position: relative;
  }

  #admin-content {
    overflow: auto;
    width: 100%;
    height: 100%;
  }
</style>
