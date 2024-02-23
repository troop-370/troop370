<script lang="ts">
  import { afterNavigate, beforeNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import NavigationView from '$components/admin/NavigationView.svelte';
  import type { MenuItem } from '$components/admin/NavigationView/_NavigationTypes.js';
  import Titlebar from '$components/admin/Titlebar.svelte';
  import { collapsedPane, collapsedPaneCompact } from '$stores/collapsedPane';
  import { compactMode } from '$stores/compactMode';
  import { motionMode } from '$stores/motionMode';
  import { hasKey, notEmpty } from '$utils';
  import type { BeforeNavigate } from '@sveltejs/kit';
  import { Flyout, ProgressRing, TextBlock, ToggleSwitch } from 'fluent-svelte';
  import { afterUpdate } from 'svelte';
  import { expoOut, linear } from 'svelte/easing';
  import { fade, fly } from 'svelte/transition';

  export let data;

  // keep track of the page path
  export let path: string = $page.url.pathname;
  afterUpdate(() => {
    // keep the path updated when the component changes
    path = $page.url.pathname;
  });

  $: userRoles = data.session.adminUser?.roles?.map((role) => role.name) || [];

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
              return `/admin/cms/collection/api::post.post?__pageTitle=Unpublished%20posts&publishedAt={"$null":true}`;
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
        ...(userRoles.includes('Super Admin') || userRoles.includes('Store Manager')
          ? [
              {
                label: 'Store orders',
                icon: 'ShoppingBag24Regular',
                href: '/admin/ecommerce/orders',
                selected: $page.url.pathname.startsWith('/admin/ecommerce/orders'),
              },
            ]
          : []),
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
                      href: '/admin/cms/collection/api::post.post?__pageTitle=Unpublished%20posts&publishedAt={"$null":true}',
                      selected:
                        $page.url.pathname + $page.url.search ===
                        '/admin/cms/collection/api::post.post?__pageTitle=Unpublished%20posts&publishedAt={%22$null%22:true}',
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
                      href: '/admin/cms/collection/api::standalone-email.standalone-email?__pageTitle=Unpublished%20standalone%20emails&publishedAt={"$null":true}',
                      selected:
                        $page.url.pathname + $page.url.search ===
                        '/admin/cms/collection/api::standalone-email.standalone-email?__pageTitle=Unpublished%20standalone%20emails&publishedAt={%22$null%22:true}',
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
                      href: '/admin/cms/collection/api::newsletter.newsletter?__pageTitle=Unpublished%20newsletters&publishedAt={"$null":true}',
                      selected:
                        $page.url.pathname + $page.url.search ===
                        '/admin/cms/collection/api::newsletter.newsletter?__pageTitle=Unpublished%20newsletters&publishedAt={%22$null%22:true}',
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
                      href: '/admin/cms/collection/api::page.page?__pageTitle=Unpublished%20pages&publishedAt={"$null":true}',
                      selected:
                        $page.url.pathname + $page.url.search ===
                        '/admin/cms/collection/api::page.page?__pageTitle=Unpublished%20pages&publishedAt={%22$null%22:true}',
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
      : $page.url.pathname.startsWith('/admin/ecommerce')
      ? [
          {
            label: 'hr',
          },
          {
            label: 'All store orders',
            icon: 'CircleSmall24Filled',
            href: '/admin/ecommerce/orders',
            selected: $page.url.pathname + $page.url.search === '/admin/ecommerce/orders',
          },
          {
            label: 'hr',
          },
          {
            label: 'Pine straw fundraiser',
            type: 'category',
          },
          {
            label: 'All orders',
            icon: 'CircleSmall24Filled',
            href: '/admin/ecommerce/orders?productId=148999309%2C149009997',
            selected:
              $page.url.pathname + $page.url.search ===
              '/admin/ecommerce/orders?productId=148999309%2C149009997',
          },
          (() => {
            const date = new Date();
            date.setMonth(date.getMonth() - 3);
            const shortIsoDate = date.toISOString().split('T')[0];
            const location = `/admin/ecommerce/orders?productId=148999309%2C149009997&createdFrom=${shortIsoDate}`;
            return {
              label: 'All orders (last three months)',
              icon: 'CircleSmall24Filled',
              href: location,
              selected: $page.url.pathname + $page.url.search === location,
            };
          })(),
          {
            label: 'Pine straw bales',
            icon: 'CircleSmall24Filled',
            href: '/admin/ecommerce/orders?productId=149009997',
            selected:
              $page.url.pathname + $page.url.search ===
              '/admin/ecommerce/orders?productId=149009997',
          },
          {
            label: 'Spread pine straw',
            icon: 'CircleSmall24Filled',
            href: '/admin/ecommerce/orders?productId=148999309',
            selected:
              $page.url.pathname + $page.url.search ===
              '/admin/ecommerce/orders?productId=148999309',
          },
          {
            label: 'Holiday wreaths fundraiser',
            type: 'category',
          },
          {
            label: 'All orders',
            icon: 'CircleSmall24Filled',
            href: '/admin/ecommerce/orders?productId=153658178%2C153614606',
            selected:
              $page.url.pathname + $page.url.search ===
              '/admin/ecommerce/orders?productId=153658178%153614606',
          },
          {
            label: 'Classic wreaths',
            icon: 'CircleSmall24Filled',
            href: '/admin/ecommerce/orders?productId=153658178',
            selected:
              $page.url.pathname + $page.url.search ===
              '/admin/ecommerce/orders?productId=153658178',
          },
          {
            label: 'Wintergreen wreaths',
            icon: 'CircleSmall24Filled',
            href: '/admin/ecommerce/orders?productId=153614606',
            selected:
              $page.url.pathname + $page.url.search ===
              '/admin/ecommerce/orders?productId=153614606',
          },
        ]
      : [];

  $: menuFooterItems = [
    {
      label: 'footer',
      children: [
        {
          label: 'hr',
        },
        {
          label: 'Settings',
          icon: 'Settings16Regular',
          onClick: () => {
            settingFlyoutOpen = !settingFlyoutOpen;
          },
        },
      ],
    },
  ];

  let windowWidth = 1000;
  $: navPaneCompactMode = windowWidth < 900;
  let settingFlyoutOpen = false;

  // variables for page transitions
  let unique = {};
  let waiting = false;
  let showSpinner = false;
  $: delay = $motionMode === 'reduced' ? 0 : 130;
  $: duration = $motionMode === 'reduced' ? 0 : 270;

  /**
   * Trigger the page transition by re-rendering the content div (which contains the slot)
   */
  function triggerTransition() {
    unique = {}; // every {} is unique; {} === {} evaluates to false
  }

  /**
   * Ensure that `waiting` is `false` after skipping a transition
   */
  function handleEndTransition() {
    waiting = false;
  }

  /**
   * Triggers the page transition unless skip conditions are met (conditions are defined in the function).
   */
  function handleTransition(navigation: BeforeNavigate) {
    // skip if user wants no motion
    if ($motionMode === 'reduced') return handleEndTransition();

    // skip transition if pathname does not change
    if (navigation.from?.url.pathname === navigation.to?.url.pathname) return handleEndTransition();

    // animate a fancy transition between pages
    triggerTransition();
  }

  beforeNavigate(handleTransition);
  afterNavigate(handleEndTransition);

  function customFade(
    node: Element,
    { delay = 0, duration = 400, easing: easing$1 = linear } = {}
  ) {
    const o = +getComputedStyle(node).opacity;

    waiting = true;
    setTimeout(() => {
      // show the loading spinner if the next page still has not loaded
      if (waiting) showSpinner = true;
    }, duration + 800);

    return {
      delay,
      duration,
      easing: easing$1,
      css: (t: number) => `opacity: ${t * o}`,
    };
  }
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
            menuItems={[...mainMenuItems, ...routeMenuItems, ...menuFooterItems]}
            showBackArrow={false}
            compact={$compactMode}
            bind:collapsedPane={$collapsedPaneCompact}
          />
        {:else}
          <NavigationView
            variant="left"
            menuItems={[...mainMenuItems, ...routeMenuItems, ...menuFooterItems]}
            showBackArrow
            compact={$compactMode}
            bind:collapsedPane={$collapsedPane}
          />
        {/if}

        <div
          class="settings-flyout"
          class:collapsedPane={navPaneCompactMode ? $collapsedPaneCompact : $collapsedPane}
        >
          <Flyout bind:open={settingFlyoutOpen} placement="right">
            <svelte:fragment slot="flyout">
              <div class="settings-flyout-flex">
                <TextBlock variant="subtitle" style="margin-bottom: 10px;">Settings</TextBlock>
                <ToggleSwitch bind:checked={$compactMode}>Compact mode</ToggleSwitch>
                <ToggleSwitch
                  checked={$motionMode === 'reduced'}
                  on:change={(evt) => {
                    if (evt.target && hasKey(evt.target, 'checked') && evt.target.checked)
                      $motionMode = 'reduced';
                    else $motionMode = 'no-preference';
                  }}
                >
                  Reduce motion
                </ToggleSwitch>
              </div>
            </svelte:fragment>
          </Flyout>
        </div>
      </div>

      <div id="admin-content-outer">
        {#key unique}
          <div style="height: 100%; width: 100%;">
            {#if !waiting}
              <div
                id="admin-content"
                in:fly={{ y: 40, duration, easing: expoOut, delay }}
                out:customFade={{ duration: delay }}
              >
                <slot />
              </div>
            {:else if showSpinner}
              <div
                id="admin-content"
                style="display: flex; flex-direction: column; gap: 14px; align-items: center; justify-content: center;"
                in:fade={{ duration: delay }}
                out:fade={{ duration: delay }}
              >
                <ProgressRing size={32} />
                <TextBlock variant="bodyStrong">Please wait</TextBlock>
              </div>
            {/if}
          </div>
        {/key}
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
    flex-grow: 0;
    flex-shrink: 0;
    display: flex;
    flex-direction: row;
    height: 100%;
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

  .settings-flyout {
    position: fixed;
    z-index: 99999;
    left: 290px;
    bottom: 67px;
  }
  .settings-flyout.collapsedPane {
    left: 50px;
  }
  .settings-flyout-flex {
    display: flex;
    flex-direction: column;
  }
</style>
