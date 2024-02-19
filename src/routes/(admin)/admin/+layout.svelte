<script lang="ts">
  import { page } from '$app/stores';
  import NavigationView from '$components/admin/NavigationView.svelte';
  import type { MenuItem } from '$components/admin/NavigationView/_NavigationTypes.js';
  import Titlebar from '$components/admin/Titlebar.svelte';
  import { collapsedPane, collapsedPaneCompact } from '$stores/collapsedPane';
  import { compactMode } from '$stores/compactMode';
  import { notEmpty } from '$utils';
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
            if (data.cmsContentTypes?.[0]) {
              return `/admin/cms/collection/api::post.post?publishedAt={"$null":true}`;
            }
            return '/admin/content-manager';
          })(),
          selected:
            $page.url.pathname.startsWith('/admin/content-manager') ||
            $page.url.pathname.startsWith('/admin/cms'),
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

  $: customCmsNav = ((): MenuItem[] => {
    const posts = data.cmsContentTypes?.find(({ uid }) => uid === 'api::post.post');
    const announcements = data.cmsContentTypes?.find(
      ({ uid }) => uid === 'api::home-page.home-page'
    );
    const standaloneEmail = data.cmsContentTypes?.find(
      ({ uid }) => uid === 'api::standalone-email.standalone-email'
    );
    const newsletterEmail = data.cmsContentTypes?.find(
      ({ uid }) => uid === 'api::newsletter.newsletter'
    );
    const pages = data.cmsContentTypes?.find(({ uid }) => uid === 'api::page.page');
    const formsAndDocsPage = data.cmsContentTypes?.find(
      ({ uid }) => uid === 'api::forms-and-documents-page.forms-and-documents-page'
    );
    const eventsPage = data.cmsContentTypes?.find(
      ({ uid }) => uid === 'api::events-page.events-page'
    );

    const postsGroup =
      posts || announcements
        ? ({
            label: 'Posts',
            type: 'expander',
            icon: 'SlideText24Regular',
            children: [
              ...(posts
                ? [
                    {
                      label: 'Unpublished posts',
                      icon: 'SlideText24Regular',
                      href: '/admin/cms/collection/api::post.post?publishedAt={"$null":true}',
                      selected:
                        $page.url.pathname + $page.url.search ===
                        '/admin/cms/collection/api::post.post?publishedAt={%22$null%22:true}',
                    },
                    {
                      label: 'All posts',
                      icon: 'Textbox24Regular',
                      href: '/admin/cms/collection/api::post.post',
                      selected:
                        $page.url.pathname + $page.url.search ===
                        '/admin/cms/collection/api::post.post',
                    },
                  ]
                : []),
              ...(announcements
                ? [
                    {
                      label: 'Announcements',
                      icon: 'Balloon24Regular',
                      href: '/admin/content-manager/single-types/api::home-page.home-page',
                      selected:
                        $page.url.pathname + $page.url.search ===
                        '/admin/content-manager/single-types/api::home-page.home-page',
                    },
                  ]
                : []),
            ],
          } satisfies MenuItem)
        : null;

    const emailsGroup =
      standaloneEmail || newsletterEmail
        ? ({
            label: 'Emails',
            type: 'expander',
            icon: 'MailMultiple24Regular',
            children: [
              ...(standaloneEmail
                ? [
                    {
                      label: 'Standalone emails',
                      icon: 'MailMultiple24Regular',
                      href: '/admin/cms/collection/api::standalone-email.standalone-email',
                      selected:
                        $page.url.pathname + $page.url.search ===
                        '/admin/cms/collection/api::standalone-email.standalone-email',
                    },
                    {
                      label: 'Unpublished standalone emails',
                      icon: 'MailMultiple24Regular',
                      href: '/admin/cms/collection/api::standalone-email.standalone-email?publishedAt={"$null":true}',
                      selected:
                        $page.url.pathname + $page.url.search ===
                        '/admin/cms/collection/api::standalone-email.standalone-email?publishedAt={%22$null%22:true}',
                    },
                  ]
                : []),
              ...(newsletterEmail
                ? [
                    {
                      label: 'Newsletters',
                      icon: 'MailTemplate24Regular',
                      href: '/admin/cms/collection/api::newsletter.newsletter',
                      selected:
                        $page.url.pathname + $page.url.search ===
                        '/admin/cms/collection/api::newsletter.newsletter',
                    },
                    {
                      label: 'Unpublished newsletters',
                      icon: 'MailTemplate24Regular',
                      href: '/admin/cms/collection/api::newsletter.newsletter?publishedAt={"$null":true}',
                      selected:
                        $page.url.pathname + $page.url.search ===
                        '/admin/cms/collection/api::newsletter.newsletter?publishedAt={%22$null%22:true}',
                    },
                  ]
                : []),
            ],
          } satisfies MenuItem)
        : null;

    const pagesGroup =
      pages || formsAndDocsPage || eventsPage
        ? ({
            label: 'Pages',
            type: 'expander',
            icon: 'DocumentText24Regular',
            children: [
              ...(pages
                ? [
                    {
                      label: 'All pages',
                      icon: 'DocumentText24Regular',
                      href: '/admin/cms/collection/api::page.page',
                      selected:
                        $page.url.pathname + $page.url.search ===
                        '/admin/cms/collection/api::page.page',
                    },
                    {
                      label: 'Unpublished pages',
                      icon: 'DocumentBulletList24Regular',
                      href: '/admin/cms/collection/api::page.page?publishedAt={"$null":true}',
                      selected:
                        $page.url.pathname + $page.url.search ===
                        '/admin/cms/collection/api::page.page?publishedAt={%22$null%22:true}',
                    },
                  ]
                : []),
              ...(formsAndDocsPage
                ? [
                    {
                      label: 'Forms and documents page',
                      icon: 'DocumentTable24Regular',
                      href: '/admin/content-manager/single-types/api::forms-and-documents-page.forms-and-documents-page',
                      selected:
                        $page.url.pathname + $page.url.search ===
                        '/admin/content-manager/single-types/api::forms-and-documents-page.forms-and-documents-page',
                    },
                  ]
                : []),
              ...(eventsPage
                ? [
                    {
                      label: 'Events page',
                      icon: 'CalendarMonth24Regular',
                      href: '/admin/content-manager/single-types/api::events-page.events-page',
                      selected:
                        $page.url.pathname + $page.url.search ===
                        '/admin/content-manager/single-types/api::events-page.events-page',
                    },
                  ]
                : []),
            ],
          } satisfies MenuItem)
        : null;

    return [postsGroup, emailsGroup, pagesGroup].filter(notEmpty);
  })();

  $: cmsCollections =
    data.cmsContentTypes
      ?.filter((type) => type.kind === 'collectionType')
      .map((type) => {
        const pathname = `/admin/cms/collection/${type.uid}`;
        const pathname2 = `/admin/content-manager/collection-types/${type.uid}`;
        return {
          label: type.info.displayName,
          icon: 'CircleSmall20Filled',
          href: pathname,
          selected:
            $page.url.pathname.startsWith(pathname) || $page.url.pathname.startsWith(pathname2),
        };
      }) || [];
  $: cmsSingleTypes =
    data.cmsContentTypes
      ?.filter((type) => type.kind === 'singleType')
      .map((type) => {
        const pathname = `/admin/content-manager/single-types/${type.uid}`;
        return {
          label: type.info.displayName,
          icon: 'CircleSmall20Filled',
          href: pathname,
          selected: $page.url.pathname.startsWith(pathname),
        };
      }) || [];

  $: routeMenuItems =
    $page.url.pathname.startsWith('/admin/cms') ||
    $page.url.pathname.startsWith('/admin/content-manager')
      ? [
          {
            label: 'hr',
          },
          {
            label: 'Workflow',
            icon: 'DataUsage24Regular',
            href: '/admin/cms/workflow',
            selected: $page.url.pathname === '/admin/cms/workflow',
            disabled: true,
          },
          {
            label: 'hr',
          },
          ...customCmsNav,
          ...(cmsCollections?.length > 0
            ? [
                {
                  type: 'expander',
                  label: 'Collections',
                  icon: 'Collections24Regular',
                  children: cmsCollections || [],
                },
              ]
            : []),
          ...(cmsSingleTypes?.length > 0
            ? [
                {
                  type: 'expander',
                  label: 'Single types',
                  icon: 'DocumentPageBottomLeft24Regular',
                  children: cmsSingleTypes || [],
                },
              ]
            : []),
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
