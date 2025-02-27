<script lang="ts">
  import { browser } from '$app/environment';
  import { afterNavigate, beforeNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import NavigationView from '$components/poptart/NavigationView.svelte';
  import type { MenuItem } from '$components/poptart/NavigationView/_NavigationTypes.js';
  import { richTextParams } from '$components/poptart/Tiptap/richTextParams.js';
  import Titlebar from '$components/poptart/Titlebar.svelte';
  import { collapsedPane, collapsedPaneCompact } from '$stores/collapsedPane';
  import { compactMode } from '$stores/compactMode';
  import { motionMode } from '$stores/motionMode';
  import { strapiEditor } from '$stores/strapiEditor';
  import { title } from '$stores/title';
  import { hasKey, notEmpty } from '$utils';
  import type { BeforeNavigate } from '@sveltejs/kit';
  import { Flyout, ProgressRing, TextBlock, ToggleSwitch } from 'fluent-svelte';
  import { afterUpdate, onMount } from 'svelte';
  import { expoOut, linear } from 'svelte/easing';
  import { fade, fly } from 'svelte/transition';

  export let data;
  $: ({ cmsContentTypes, apps, userPermissions } = data);

  // keep track of the page path
  export let path: string = $page.url.pathname;
  afterUpdate(() => {
    // keep the path updated when the component changes
    path = $page.url.pathname;
  });

  // register the service worker so that the PWA can be installed
  onMount(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/poptart/service-worker.js', { scope: '/poptart/' })
        .catch((err) => console.error('Service worker registration failed', err));
    }
  });

  $: canReadUploads = !!$userPermissions?.raw.find((p) =>
    p.action.startsWith('plugin::upload.read')
  );

  $: userRoles = data.session.adminUser?.roles?.map((role) => role.name) || [];

  $: mainMenuItems = [
    {
      label: 'Dashboard',
      icon: 'Home16Regular',
      href: `/poptart`,
    },
    {
      label: 'Apps',
      icon: 'Apps16Regular',
      type: 'expander',
      children: ($apps || []).map(({ label, icon, disabled, href, selected }) => {
        return { label, icon, disabled, href, selected: selected($page.url) };
      }),
    },
  ];

  $: customCmsNav = ((): MenuItem[] => {
    const posts = $cmsContentTypes?.find(({ uid }) => uid === 'api::post.post');
    const announcements = $cmsContentTypes?.find(({ uid }) => uid === 'api::home-page.home-page');
    const standaloneEmail = $cmsContentTypes?.find(
      ({ uid }) => uid === 'api::standalone-email.standalone-email'
    );
    const newsletterEmail = $cmsContentTypes?.find(
      ({ uid }) => uid === 'api::newsletter.newsletter'
    );
    const pages = $cmsContentTypes?.find(({ uid }) => uid === 'api::page.page');
    const formsAndDocsPage = $cmsContentTypes?.find(
      ({ uid }) => uid === 'api::forms-and-documents-page.forms-and-documents-page'
    );
    const eventsPage = $cmsContentTypes?.find(({ uid }) => uid === 'api::events-page.events-page');

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
                      href: '/poptart/cms/collection/api::post.post?__pageTitle=Unpublished%20posts&stage={"$ne":"published"}',
                      selected:
                        $page.url.pathname + $page.url.search ===
                        '/poptart/cms/collection/api::post.post?__pageTitle=Unpublished%20posts&stage={%22$ne%22:%22published%22}',
                    },
                    {
                      label: 'All posts',
                      icon: 'Textbox24Regular',
                      href: '/poptart/cms/collection/api::post.post',
                      selected:
                        $page.url.pathname + $page.url.search ===
                        '/poptart/cms/collection/api::post.post',
                    },
                  ]
                : []),
              ...(announcements
                ? [
                    {
                      label: 'Announcements',
                      icon: 'Balloon24Regular',
                      href: '/poptart/content-manager/single-types/api::home-page.home-page',
                      selected:
                        $page.url.pathname + $page.url.search ===
                        '/poptart/content-manager/single-types/api::home-page.home-page',
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
                      href: '/poptart/cms/collection/api::standalone-email.standalone-email',
                      selected:
                        $page.url.pathname + $page.url.search ===
                        '/poptart/cms/collection/api::standalone-email.standalone-email',
                    },
                    {
                      label: 'Unpublished standalone emails',
                      icon: 'MailMultiple24Regular',
                      href: '/poptart/cms/collection/api::standalone-email.standalone-email?__pageTitle=Unpublished%20standalone%20emails&stage={"$ne":"published"}',
                      selected:
                        $page.url.pathname + $page.url.search ===
                        '/poptart/cms/collection/api::standalone-email.standalone-email?__pageTitle=Unpublished%20standalone%20emails&stage={%22$ne%22:%22published%22}',
                    },
                  ]
                : []),
              ...(newsletterEmail
                ? [
                    {
                      label: 'Newsletters',
                      icon: 'MailTemplate24Regular',
                      href: '/poptart/cms/collection/api::newsletter.newsletter',
                      selected:
                        $page.url.pathname + $page.url.search ===
                        '/poptart/cms/collection/api::newsletter.newsletter',
                    },
                    {
                      label: 'Unpublished newsletters',
                      icon: 'MailTemplate24Regular',
                      href: '/poptart/cms/collection/api::newsletter.newsletter?__pageTitle=Unpublished%20newsletters&stage={"$ne":"published"}',
                      selected:
                        $page.url.pathname + $page.url.search ===
                        '/poptart/cms/collection/api::newsletter.newsletter?__pageTitle=Unpublished%20newsletters&stage={%22$ne%22:%22published%22}',
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
                      href: '/poptart/cms/collection/api::page.page',
                      selected:
                        $page.url.pathname + $page.url.search ===
                        '/poptart/cms/collection/api::page.page',
                    },
                    {
                      label: 'Unpublished pages',
                      icon: 'DocumentBulletList24Regular',
                      href: '/poptart/cms/collection/api::page.page?__pageTitle=Unpublished%20pages&stage={"$ne":"published"}',
                      selected:
                        $page.url.pathname + $page.url.search ===
                        '/poptart/cms/collection/api::page.page?__pageTitle=Unpublished%20pages&stage={%22$ne%22:%22published%22}',
                    },
                  ]
                : []),
              ...(formsAndDocsPage
                ? [
                    {
                      label: 'Forms and documents page',
                      icon: 'DocumentTable24Regular',
                      href: '/poptart/content-manager/single-types/api::forms-and-documents-page.forms-and-documents-page',
                      selected:
                        $page.url.pathname + $page.url.search ===
                        '/poptart/content-manager/single-types/api::forms-and-documents-page.forms-and-documents-page',
                    },
                  ]
                : []),
              ...(eventsPage
                ? [
                    {
                      label: 'Events page',
                      icon: 'CalendarMonth24Regular',
                      href: '/poptart/content-manager/single-types/api::events-page.events-page',
                      selected:
                        $page.url.pathname + $page.url.search ===
                        '/poptart/content-manager/single-types/api::events-page.events-page',
                    },
                  ]
                : []),
            ],
          } satisfies MenuItem)
        : null;

    return [postsGroup, emailsGroup, pagesGroup].filter(notEmpty);
  })();

  $: cmsCollections =
    $cmsContentTypes
      ?.filter((type) => type.kind === 'collectionType')
      .map((type) => {
        const pathname = `/poptart/cms/collection/${type.uid}`;
        const pathname2 = `/poptart/content-manager/collection-types/${type.uid}`;
        return {
          label: type.info.displayName,
          icon: 'CircleSmall20Filled',
          href: pathname,
          selected:
            $page.url.pathname.startsWith(pathname) || $page.url.pathname.startsWith(pathname2),
        };
      }) || [];
  $: cmsSingleTypes =
    $cmsContentTypes
      ?.filter((type) => type.kind === 'singleType')
      .map((type) => {
        const pathname = `/poptart/content-manager/single-types/${type.uid}`;
        return {
          label: type.info.displayName,
          icon: 'CircleSmall20Filled',
          href: pathname,
          selected: $page.url.pathname.startsWith(pathname),
        };
      }) || [];

  $: routeMenuItems =
    $page.url.pathname.startsWith('/poptart/cms') ||
    $page.url.pathname.startsWith('/poptart/content-manager')
      ? [
          {
            label: 'hr',
          },
          {
            label: 'Workflow',
            icon: 'DataUsage24Regular',
            href: '/poptart/cms/workflow',
            selected: $page.url.pathname === '/poptart/cms/workflow',
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
      : $page.url.pathname.startsWith('/poptart/ecommerce')
        ? [
            {
              label: 'hr',
            },
            {
              label: 'All store orders',
              icon: 'Receipt24Regular',
              href: '/poptart/ecommerce/orders',
              selected: $page.url.pathname + $page.url.search === '/poptart/ecommerce/orders',
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
              href: '/poptart/ecommerce/orders?productId=148999309%2C149009997%2C696447273%2C696427357&__pageTitle=All%20pine%20straw%20fundraiser%20orders',
              selected:
                $page.url.pathname + $page.url.search ===
                '/poptart/ecommerce/orders?productId=148999309%2C149009997%2C696447273%2C696427357&__pageTitle=All%20pine%20straw%20fundraiser%20orders',
            },
            (() => {
              const date = new Date();
              date.setMonth(date.getMonth() - 3);
              const shortIsoDate = date.toISOString().split('T')[0];
              const location = `/poptart/ecommerce/orders?productId=148999309%2C149009997%2C696447273%2C696427357&createdFrom=${shortIsoDate}&__pageTitle=Recent%20pine%20straw%20fundraiser%20orders`;
              return {
                label: 'Recent orders (last three months)',
                icon: 'Clock24Regular',
                href: location,
                selected: $page.url.pathname + $page.url.search === location,
              };
            })(),
            {
              label: 'Pine straw bales',
              icon: 'CircleSmall24Filled',
              href: '/poptart/ecommerce/orders?productId=149009997%2C696447273&__pageTitle=Pine%20straw%20bales%20orders',
              selected:
                $page.url.pathname + $page.url.search ===
                '/poptart/ecommerce/orders?productId=149009997%2C696447273&__pageTitle=Pine%20straw%20bales%20orders',
            },
            {
              label: 'Spread pine straw',
              icon: 'CircleSmall24Filled',
              href: '/poptart/ecommerce/orders?productId=148999309%2C696427357&__pageTitle=Spread%20pine%20straw%20orders',
              selected:
                $page.url.pathname + $page.url.search ===
                '/poptart/ecommerce/orders?productId=148999309%2C696427357&__pageTitle=Spread%20pine%20straw%20orders',
            },
            {
              label: 'Holiday wreaths fundraiser',
              type: 'category',
            },
            {
              label: 'All orders',
              icon: 'CircleSmall24Filled',
              href: '/poptart/ecommerce/orders?productId=153658178%2C153614606&__pageTitle=All%20holiday%20wreath%20orders',
              selected:
                $page.url.pathname + $page.url.search ===
                '/poptart/ecommerce/orders?productId=153658178%2C153614606&__pageTitle=All%20holiday%20wreath%20orders',
            },
            {
              label: 'Classic wreaths',
              icon: 'CircleSmall24Filled',
              href: '/poptart/ecommerce/orders?productId=153658178&__pageTitle=All%20classic%20wreath%20orders',
              selected:
                $page.url.pathname + $page.url.search ===
                '/poptart/ecommerce/orders?productId=153658178&__pageTitle=All%20classic%20wreath%20orders',
            },
            {
              label: 'Wintergreen wreaths',
              icon: 'CircleSmall24Filled',
              href: '/poptart/ecommerce/orders?productId=153614606&__pageTitle=All%20wintergreen%20wreath%20orders',
              selected:
                $page.url.pathname + $page.url.search ===
                '/poptart/ecommerce/orders?productId=153614606&__pageTitle=All%20wintergreen%20wreath%20orders',
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

  // track editor fullscreen mode
  let editorFullscreen =
    $richTextParams.isActive('fs') ||
    $page.url.searchParams.get('fs') === '1' ||
    $page.url.searchParams.get('fs') === '3' ||
    $page.url.searchParams.get('fs') === 'force';
  $: if (browser) {
    editorFullscreen =
      $richTextParams.isActive('fs') || $page.url.searchParams.get('fs') === 'force';
  }
  afterNavigate(() => {
    editorFullscreen =
      $richTextParams.isActive('fs') || $page.url.searchParams.get('fs') === 'force';
  });

  let windowWidth = 1000;
  $: navPaneCompactMode = editorFullscreen || windowWidth < 900;
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

    // do not trigger a transition when navigating between pages
    // that are embedded in a strapi iframe
    if (
      navigation.from?.route.id === '/(admin)/poptart/[...rest]' &&
      navigation.to?.route.id === '/(admin)/poptart/[...rest]'
    ) {
      return handleEndTransition();
    }

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

  $: hideSidebar =
    (!!browser && !!window.name) || $page.url.searchParams.get('childWindow') === '1';
</script>

<svelte:head>
  <title>{$title} - Troop 370 Admin</title>
  <link rel="manifest" href="/poptart/manifest.webmanifest" />
</svelte:head>

<svelte:window bind:innerWidth={windowWidth} />

{#if !['/poptart/login'].includes(path)}
  <div id="admin">
    <div id="admin-header">
      <Titlebar {data} />
      <!-- <Ribbon /> -->
    </div>

    <div id="admin-app">
      {#if !hideSidebar}
        <div id="admin-sidebar">
          {#if navPaneCompactMode}
            <NavigationView
              variant="leftCompact"
              menuItems={[...mainMenuItems, ...routeMenuItems, ...menuFooterItems]}
              showBackArrow={editorFullscreen && windowWidth >= 900}
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
                  <ToggleSwitch bind:checked={$strapiEditor}>Prefer legacy editor</ToggleSwitch>
                </div>
              </svelte:fragment>
            </Flyout>
          </div>
        </div>
      {/if}

      <div id="admin-content-outer" class:noRadius={hideSidebar}>
        {#key unique}
          <div style="height: 100%; width: 100%;">
            {#if !waiting}
              <div
                id="admin-content"
                in:fly|global={{ y: 40, duration, easing: expoOut, delay }}
                out:customFade|global={{ duration: delay }}
              >
                <slot />
              </div>
            {:else if showSpinner}
              <div
                id="admin-content"
                style="display: flex; flex-direction: column; gap: 14px; align-items: center; justify-content: center;"
                in:fade|global={{ duration: delay }}
                out:fade|global={{ duration: delay }}
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
  #admin-content-outer.noRadius {
    border-radius: 0;
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
    bottom: 84px;
  }
  .settings-flyout.collapsedPane {
    left: 50px;
  }
  .settings-flyout-flex {
    display: flex;
    flex-direction: column;
  }
</style>
