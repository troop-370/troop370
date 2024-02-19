<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import FluentIcon from '$components/admin/FluentIcon.svelte';
  import { IconButton, ListItem } from 'fluent-svelte';
  import { focusTrap } from 'fluent-svelte/internal';
  import type { MenuItem, Tree } from './_NavigationTypes';
  import TreeView from './_TreeView.svelte';

  export let headerText = '';
  export let menuItems: MenuItem[] = [];
  export let showBackArrow: boolean = false;
  export let hideMenuButton: boolean = false;
  export let compact: boolean = false;
  export let collapsed: boolean = false;
  export let variant: 'left' | 'leftCompact' = 'left';

  $: _focusTrap = variant === 'leftCompact' && !collapsed ? focusTrap : () => {};

  function itemMap(item: MenuItem): Tree {
    return {
      name: item.label,
      icon: item.icon,
      path: item.href,
      type: item.type ?? 'navigation',
      pages: item.children?.map(itemMap),
      onClick: item.onClick,
      selected: item.selected ?? false,
      disabled: item.disabled ?? false,
    };
  }

  let tree: Tree[];
  $: tree = menuItems.map(itemMap);

  let previousPage: string = '';
  afterNavigate(({ from }) => {
    previousPage = from?.url?.pathname || previousPage;
  });
</script>

<aside class:collapsed class:leftCompact={variant === 'leftCompact'} use:_focusTrap>
  {#if (!headerText && !hideMenuButton) || showBackArrow}
    <div class="buttonrow">
      {#if showBackArrow}
        <IconButton disabled={!previousPage} on:click={() => history.back()}>
          <FluentIcon name={'ArrowLeft16Regular'} />
        </IconButton>
      {/if}
      {#if !headerText && !hideMenuButton}
        <IconButton on:click={() => (collapsed = !collapsed)}>
          <FluentIcon name={'Navigation16Regular'} />
        </IconButton>
      {/if}
    </div>
  {/if}
  {#if headerText && !hideMenuButton}
    <ListItem>
      <svelte:fragment slot="icon">
        <FluentIcon name={'Navigation16Regular'} />
      </svelte:fragment>
      <span>{headerText}</span>
    </ListItem>
  {/if}

  <slot name="custom" />

  <TreeView {tree} {compact} {collapsed}>
    <svelte:fragment slot="internal">
      <slot name="internal" />
    </svelte:fragment>
  </TreeView>

  {#if variant === 'leftCompact'}
    <div
      class="navigation-pane-click-away"
      class:darken={!collapsed}
      on:click={() => (collapsed = true)}
      on:keypress={(evt) => {
        if (evt.key === 'Esc') {
          collapsed = true;
        }
      }}
    />
  {/if}
</aside>

{#if variant === 'leftCompact'}
  <div class="spacer" />
{/if}

<style>
  aside {
    width: 290px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    flex-grow: 0;
    transition: width 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  aside.collapsed {
    width: 50px;
  }

  aside.leftCompact {
    position: absolute;
    background-color: black;
    height: calc(100% - env(titlebar-area-height, 33px));
    z-index: 999;
    background-color: var(--titlebar-bg);
    box-shadow: inset -1px 0 0 0 var(--fds-surface-stroke-flyout), var(--fds-flyout-shadow);
    /* border-radius: 0 6px 6px 0; */
  }

  aside.leftCompact.collapsed {
    border: none;
    border-radius: 0;
    box-shadow: none;
  }

  .spacer {
    width: 50px;
    flex-grow: 0;
    flex-shrink: 0;
  }

  span {
    font-weight: 500;
  }

  .buttonrow {
    margin: 3px 5px 3px 9px;
  }

  .navigation-pane-click-away {
    align-items: center;
    block-size: 100%;
    display: none;
    flex-direction: column;
    inline-size: 100%;
    inset-block-start: 0;
    inset-inline-start: 0;
    justify-content: center;
    position: fixed;
    z-index: -1;
  }
  .navigation-pane-click-away.darken {
    display: flex;
  }
</style>
