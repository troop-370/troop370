<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import FluentIcon from '$components/poptart/FluentIcon.svelte';
  import { Button, MenuFlyout, MenuFlyoutItem } from 'fluent-svelte';

  let tabsContainerElement: HTMLDivElement;
  let activeTab: 'content-manager' | 'settings' | 'media' = $page.url.pathname.startsWith(
    '/poptart/settings'
  )
    ? 'settings'
    : $page.url.pathname.startsWith('/poptart/plugins/upload')
    ? 'upload'
    : 'content-manager';
  let mouseOverActiveTab = false;
  $: ({ activeTabWidth, activeTabLeft } = (() => {
    const tabsContainerRect = tabsContainerElement?.getBoundingClientRect();
    const activeTabRect = tabsContainerElement
      ?.querySelector(`[data-tab='${activeTab}']`)
      ?.getBoundingClientRect();
    return {
      activeTabWidth: (activeTabRect?.width || 0) - (mouseOverActiveTab ? 0 : 22),
      activeTabLeft:
        (activeTabRect?.left || 0) - (tabsContainerRect?.left || 0) + (mouseOverActiveTab ? 0 : 11),
    };
  })());

  function handleTabClick(evt: CustomEvent) {
    const target = evt.target as HTMLElement | undefined;
    const clickedTabName = target?.getAttribute('data-tab');
    if (clickedTabName) {
      activeTab = clickedTabName;
      mouseOverActiveTab = true;
      goto(tabLocations[activeTab]);
    }
  }

  function setTab(tabName: string) {
    activeTab = tabName;
  }

  function handleTabMouseEnter(evt: CustomEvent) {
    const target = evt.target as HTMLElement | undefined;
    const tabName = target?.getAttribute('data-tab');
    if (tabName === activeTab) mouseOverActiveTab = true;
    else mouseOverActiveTab = false;
  }

  function handleTabMouseLeave(evt: CustomEvent) {
    const target = evt.target as HTMLElement | undefined;
    const tabName = target?.getAttribute('data-tab');
    if (tabName === activeTab) mouseOverActiveTab = false;
    else mouseOverActiveTab = false;
  }

  let width = 1000;

  let fileMenuOpen = false;
  let saveDocDialogOpen = false;
  let modeMenuOpen = false;

  const tabLocations = {
    'content-manager': '/poptart/content-manager',
    settings: '/poptart/settings',
    upload: '/poptart/plugins/upload',
  };
</script>

<div class="ribbon" bind:offsetWidth={width}>
  <div style="padding: 0 8px;">
    <div class="top">
      <div class="tabs" bind:this={tabsContainerElement}>
        <MenuFlyout alignment="start" placement="bottom" offset={0} bind:open={fileMenuOpen}>
          <svelte:fragment slot="flyout">
            <MenuFlyoutItem
              on:click={() => {
                goto('/');
              }}
            >
              <!-- <ProgressRing size={16} /> -->
              <FluentIcon name="Home24Regular" mode="buttonIconLeft" />
              Go to website
            </MenuFlyoutItem>
          </svelte:fragment>
        </MenuFlyout>
        <Button on:click={() => (fileMenuOpen = !fileMenuOpen)}>File</Button>
        {#if width > 400}
          <Button
            data-tab={'content-manager'}
            on:click={handleTabClick}
            on:mouseenter={handleTabMouseEnter}
            on:mouseleave={handleTabMouseLeave}
          >
            Content manager
          </Button>
          <Button
            data-tab={'upload'}
            on:click={handleTabClick}
            on:mouseenter={handleTabMouseEnter}
            on:mouseleave={handleTabMouseLeave}
          >
            Media
          </Button>
          <Button
            data-tab={'settings'}
            on:click={handleTabClick}
            on:mouseenter={handleTabMouseEnter}
            on:mouseleave={handleTabMouseLeave}
          >
            Settings
          </Button>
          <div class="tabline" style="width: {activeTabWidth}px; left: {activeTabLeft}px;" />
        {/if}
      </div>
      <div class="focuszone" />
    </div>
  </div>
  <!-- {#if width > 400}
    <div class="tabpanel">
      <HomeTabPanel visible={activeTab === 'home'} {editor} {options} />
      <InsertTabPanel visible={activeTab === 'insert'} {editor} {options} {user} />
      <LayoutTabPanel visible={activeTab === 'layout'} {editor} {options} />
      <ReviewTabPanel
        visible={activeTab === 'review'}
        {editor}
        {options}
        {user}
        {trackChanges}
        {toggleTrackChanges}
        bind:docStatsDialogOpen
      />
      <ViewTabPanel visible={activeTab === 'view'} {editor} {options} />
      {#if options?.features.tables}
        <TableTabPanel visible={activeTab === 'table'} {editor} {options} {setTab} />
      {/if}
      {#if options?.features.widgets?.youtube}
        <YoutubeTabPanel visible={activeTab === 'youtube'} {editor} {setTab} />
      {/if}
      {#if options?.features.widgets?.photoWidget}
        <PhotoTabPanel visible={activeTab === 'photo'} {editor} {setTab} />
      {/if}
      {#if options?.features.pullQuote}
        <PullQuoteTabPanel visible={activeTab === 'pullQuote'} {editor} {setTab} />
      {/if}
    </div>
  {/if} -->
</div>

<style>
  .ribbon {
    width: 100%;
    background-color: var(--titlebar-bg);
    user-select: none;
  }

  .top {
    display: flex;
    justify-content: space-between;
    white-space: nowrap;
    height: 36px;
    position: relative;
    margin-top: 4px;
    -webkit-app-region: drag;
    app-region: drag;
    user-select: none;
  }

  .tabpanel {
    height: 40px;
    background-color: var(--fds-solid-background-quarternary);
    color: var(--fds-text-primary);
    border-bottom: none;
    border-radius: var(--fds-control-corner-radius);
    box-sizing: border-box;
    box-shadow: rgba(0, 0, 0, 0.133) 0px 1.6px 3.6px 0px, rgba(0, 0, 0, 0.11) 0px 0.3px 0.9px 0px;
    z-index: 2;
    position: relative;
    display: flex;
    justify-content: left;
    /* overflow: hidden; */
    --tabpanelmargin: 8px;
    margin: 0 var(--tabpanelmargin);
    width: calc(100% - (2 * var(--tabpanelmargin)));
  }

  .tabpanel :global(.panel) {
    display: flex;
    justify-content: left;
    align-items: center;
    --margin: 4px;
    margin: var(--margin);
    visibility: visible;
    width: calc(100% - (2 * var(--margin)));
    height: 32px;
    transform: translateX(-20px);
    opacity: 0;
    transition: transform 0.15s ease 0s;
    white-space: nowrap;
    flex-wrap: nowrap;
    align-content: flex-start;
    gap: 4px;
    position: absolute;
    left: 0;
    box-sizing: border-box;
  }

  .tabpanel :global(.panel.visible) {
    visibility: visible;
    transform: none;
    opacity: 100;
    z-index: 1;
    transition: transform 0.15s ease 0s, opacity 0.15s ease 0s;
  }

  .tabpanel :global(.panel > .button),
  .tabpanel :global(.panel > .tooltip-wrapper > .button) {
    height: 32px;
    background-color: transparent !important;
    box-shadow: none;
  }

  .tabpanel :global(.panel > .icon-button),
  .tabpanel :global(.panel > .tooltip-wrapper > .icon-button) {
    width: 32px;
    height: 32px;
  }

  .tabpanel :global(.panel > span.bar) {
    display: inline-flex;
    height: 24px;
    align-items: center;
    margin: 4px 4px;
    width: 1px;
    background-color: var(--fds-control-strong-fill-disabled);
    opacity: 0.6;
  }
  @media (resolution: 144dpi) {
    .tabpanel :global(.panel > span.bar) {
      width: 0.67px;
    }
  }

  .tabpanel,
  .focuszone {
    --mouse-hover: #e1dfdd;
    --mouse-active: #c8c6c4;
    --tool-active: #d2d0ce;
    --tool-active-hover: #979593;
  }
  @media (prefers-color-scheme: dark) {
    .tabpanel,
    .focuszone {
      --mouse-hover: #484644;
      --mouse-active: #797775;
      --tool-active: #605e5c;
      --tool-active-hover: #8a8886;
    }
  }

  .focuszone :global(.button.active:not(.style-accent)),
  .tabpanel :global(.panel > .button.active),
  .tabpanel :global(.panel > .icon-button.active),
  .tabpanel :global(.panel > .tooltip-wrapper > .button.active),
  .tabpanel :global(.panel > .tooltip-wrapper > .icon-button.active) {
    background-color: var(--tool-active) !important;
    background-color: var(--mouse-hover) !important;
  }

  .focuszone :global(.button.active:not(.style-accent)):hover:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .button.active):hover:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .icon-button.active):hover:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .tooltip-wrapper > .button.active):hover:not(disabled):not(.disabled),
  .tabpanel
    :global(.panel > .tooltip-wrapper > .icon-button.active):hover:not(disabled):not(.disabled) {
    box-shadow: inset 0 0 0 1px var(--tool-active-hover);
  }

  .focuszone :global(.button:not(.style-accent)):hover:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .button):hover:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .icon-button):hover:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .tooltip-wrapper > .button):hover:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .tooltip-wrapper > .icon-button):hover:not(disabled):not(.disabled) {
    background-color: var(--mouse-hover) !important;
  }

  .focuszone :global(.button:not(.style-accent)):active:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .button):active:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .icon-button):active:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .tooltip-wrapper > .button):active:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .tooltip-wrapper > .icon-button):active:not(disabled):not(.disabled) {
    background-color: var(--mouse-active) !important;
  }

  .tabpanel :global(.panel > .tooltip-wrapper > .button.style-standard),
  .tabpanel :global(.panel > .button.style-standard) {
    padding-left: 6px;
    padding-right: 6px;
  }

  .tabpanel :global(.panel > .tooltip-wrapper > .icon-button),
  .tabpanel :global(.panel > .icon-button) {
    padding: 6px;
  }
  .tabpanel :global(.panel > .tooltip-wrapper > .icon-button svg),
  .tabpanel :global(.panel > .icon-button svg) {
    inline-size: 18px;
  }

  .tabpanel :global(.panel > .tooltip-wrapper > .button.disabled svg),
  .tabpanel :global(.panel > .tooltip-wrapper > .icon-button.disabled svg),
  .tabpanel :global(.panel > .button.disabled svg),
  .tabpanel :global(.panel > .icon-button.disabled svg) {
    fill: #3a3a38ff;
    opacity: 0.4;
  }
  @media (prefers-color-scheme: dark) {
    .tabpanel :global(.panel > .tooltip-wrapper > .button.disabled svg),
    .tabpanel :global(.panel > .tooltip-wrapper > .icon-button.disabled svg),
    .tabpanel :global(.panel > .button.disabled svg),
    .tabpanel :global(.panel > .icon-button.disabled svg) {
      fill: #d4d4d4ff;
    }
  }

  .tabpanel :global(.panel > .menu-flyout-wrapper) {
    margin-right: -4px;
    height: 32px;
  }

  .tabs {
    position: relative;
    display: flex;
    flex-direction: row;
    height: 30px;
    -webkit-app-region: no-drag;
    app-region: no-drag;
  }

  .tabs :global(.button.style-standard) {
    background-color: transparent;
    box-shadow: none;
    padding-left: 11px;
    padding-right: 11px;
  }

  .tabs :global(.button.style-standard):hover:not(disabled):not(.disabled) {
    background-color: var(--fds-subtle-fill-secondary);
  }

  .tabs :global(.button.style-standard):active:not(disabled):not(.disabled) {
    background-color: var(--fds-subtle-fill-tertiary);
    color: var(--fds-text-secondary);
  }

  .tabs :global(.button.style-standard[data-contextual='true']) {
    color: var(--fds-accent-default);
  }

  .tabline {
    margin: 0px;
    bottom: 0px;
    left: 53.9479px;
    width: 108.031px;
    height: 2.4px;
    pointer-events: none;
    position: absolute;
    transition: all 150ms cubic-bezier(0.17, 0.17, 0, 1) 0s;
    float: left;
    background-color: var(--fds-accent-default);
    border-radius: 6px;
  }

  .focuszone {
    -webkit-app-region: no-drag;
    app-region: no-drag;
    display: flex;
    flex-direction: row;
    gap: 5px;
    align-items: center;
    height: 32px;
    color: var(--fds-text-primary);
  }

  .au {
    display: flex;
    flex-direction: row;
  }

  :global(.awareness-user) {
    padding: 0 !important;
  }

  .focuszone :global(.tooltip-wrapper) {
    height: 32px;
    width: 32px;
  }

  .focuszone :global(.button) {
    height: 24px;
    margin-bottom: 2px;
    font-size: var(--fds-caption-font-size);
    padding-left: 8px;
    padding-right: 8px;
  }
  .focuszone :global(.button-icon.ribbon-icon) {
    margin-right: 4px !important;
  }
  .focuszone :global(.button-icon:nth-of-type(2)) {
    margin-left: 2px !important;
  }
  .focuszone :global(.button svg) {
    width: 16px;
    height: 16px;
  }

  .focuszone :global(.icon-button) {
    height: 32px;
    width: 32px;
  }

  :global(.ribbon-person-picture) {
    border: none !important;
    box-shadow: 0 0 0 2.4px currentColor;
    -webkit-user-drag: none;
  }
</style>
