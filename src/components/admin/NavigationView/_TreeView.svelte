<script lang="ts">
  import { afterNavigate, goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { IconButton, ListItem, MenuFlyout, PersonPicture, TextBlock } from 'fluent-svelte';
  import { onMount } from 'svelte';
  import FluentIcon from '../FluentIcon.svelte';
  import type { Tree } from './_NavigationTypes';

  export let tree: Tree[] = [];
  export let __depth = 0;
  export let compact = false;
  export let collapsed = false;

  let treeViewState: Record<string, boolean> | undefined;

  onMount(() => {
    // Check localStorage for an existing treeViewState
    // If none exists, use a blank object string
    treeViewState = JSON.parse(localStorage.getItem('treeViewState') ?? '{}');
  });

  // Utility function for converting regular names to kebab case
  const id = (s: string) => s.toLowerCase().split(' ').join('-');

  // Function for expanding/collapsing docs categories
  function toggleExpansion(event: MouseEvent, name: string) {
    event.stopPropagation();

    // Modify treeViewState to have the opposite of the previous entry for the category
    if (treeViewState) treeViewState[id(name)] = !treeViewState[id(name)];

    // Update value in localStorage for persistence
    localStorage.setItem('treeViewState', JSON.stringify(treeViewState || {}));
  }

  function collapseAllTrees() {
    treeViewState = Object.fromEntries(
      Object.entries(treeViewState || {}).map(([key]) => {
        return [key, false];
      })
    );
    localStorage.setItem('treeViewState', JSON.stringify(treeViewState || {}));
  }

  $: footer = (tree || []).find((tr) => tr.name === 'footer');

  let collapsedFlyoutAnchor: Record<string, HTMLDivElement> = {};
  let collapsedFlyoutWrapper: Record<string, HTMLDivElement> = {};
  let collapsedFlyoutOpen: Record<string, boolean> = {};
  let windowHeight = 0;
  afterNavigate(() => {
    collapsedFlyoutOpen = Object.fromEntries(
      Object.entries(collapsedFlyoutOpen).map(([key]) => [key, false])
    );
  });
</script>

<svelte:window bind:innerHeight={windowHeight} />

<div class="tree-view" class:collapsed>
  {#each (tree || []).filter((tr) => tr.name !== 'footer') as { name, path, type, pages, icon, onClick, selected }}
    {#if name === 'hr'}
      <hr />
    {:else if type === 'category' || type === 'expander'}
      {#if __depth > 0 || type === 'expander'}
        {@const expanded = collapsed ? false : treeViewState?.[id(name)]}
        {@const flyoutRect = collapsedFlyoutWrapper[name]?.getBoundingClientRect()}
        {@const flyoutAnchorRect = collapsedFlyoutAnchor[name]?.getBoundingClientRect()}
        {@const flyoutOffScreenPixels = Math.max(0, flyoutAnchorRect?.bottom - windowHeight) || 0}
        {@const top =
          (flyoutRect?.top || 0) + flyoutOffScreenPixels === 0 ? 33 + 8 : flyoutRect?.top || 0}
        <div
          class="subtree"
          class:expanded
          style="
            --top: {top}px;
            --screenOffset: {flyoutOffScreenPixels > 0 ? flyoutOffScreenPixels + 8 : 0}px;
            --maxHeight: {windowHeight || 0}px;
            display: {collapsed ? 'flex' : 'block'};
          "
        >
          {#if __depth === 0 && collapsed}
            <IconButton
              class="tree-view-collapsed-flyout-button {compact ? 'compact' : ''}"
              title={name}
              on:click={() => {
                collapsedFlyoutOpen[name] = !collapsedFlyoutOpen[name];
              }}
            >
              <FluentIcon name={icon || ''} />
            </IconButton>
            <MenuFlyout
              bind:open={collapsedFlyoutOpen[name]}
              alignment="start"
              placement="bottom"
              class="tree-view-collapsed-flyout"
              bind:wrapperElement={collapsedFlyoutWrapper[name]}
              bind:anchorElement={collapsedFlyoutAnchor[name]}
              closable
            >
              <svelte:fragment slot="flyout">
                <TextBlock class="category-header" variant="bodyStrong">{name}</TextBlock>
                <svelte:self {__depth} tree={pages} {compact} />
              </svelte:fragment>
            </MenuFlyout>
          {:else}
            <ListItem
              type="expander"
              {expanded}
              on:click={(e) => {
                // @ts-ignore
                toggleExpansion(e, name);
                onClick?.();
              }}
              style="--depth: {__depth}"
              class="listitem {compact ? 'compact' : ''} {collapsed ? 'collapsed' : ''}"
              {collapsed}
            >
              <svelte:fragment slot="icon">
                <FluentIcon name={icon || ''} />
              </svelte:fragment>
              {name}
              <svelte:fragment slot="icon-end">
                {#if !collapsed}
                  {#if expanded}
                    <FluentIcon name={'ChevronUp12Regular'} />
                  {:else}
                    <FluentIcon name={'ChevronDown12Regular'} />
                  {/if}
                {/if}
              </svelte:fragment>
            </ListItem>
          {/if}
          {#if expanded}
            <div class="subtree-items">
              <svelte:self __depth={__depth + 1} tree={pages} {compact} {collapsed} />
            </div>
          {/if}
        </div>
      {:else if !collapsed}
        <TextBlock class="category-header" variant="bodyStrong">{name}</TextBlock>
        <svelte:self __depth={__depth + 1} tree={pages} {compact} {collapsed} />
      {/if}
    {:else}
      <ListItem
        on:click={(e) => {
          e.preventDefault();
          onClick?.();
          if (path) goto(path);
        }}
        type="navigation"
        selected={selected ||
          path === $page.url.pathname ||
          path?.slice(0, -1) === $page.url.pathname}
        href={path}
        style="--depth: {__depth}"
        class="listitem {compact ? 'compact' : ''} {collapsed ? 'collapsed' : ''}"
        {collapsed}
        title={collapsed ? name : undefined}
      >
        <svelte:fragment slot="icon">
          {#if icon?.includes('http')}
            <PersonPicture size={24} src={icon} alt={name} loading="lazy" />
          {:else}
            <FluentIcon name={icon || ''} />
          {/if}
        </svelte:fragment>
        {@const isScoped = `${name}`.split('::').length === 2}
        {#if isScoped}
          <div class="label-wrapper">
            {name.split('::')[1]}
            <span class="scope">{name.split('::')[0]}</span>
          </div>
        {:else}
          {name}
        {/if}
      </ListItem>
    {/if}
  {/each}
  {#if __depth === 0}
    <slot name="internal" />
  {/if}
</div>

{#if footer}
  <div class="footer">
    <svelte:self __depth={__depth + 1} tree={footer.pages} {compact} {collapsed} />
  </div>
{/if}

<style>
  /* Add padding to subtrees for the nesting effect */
  .subtree-items :global(.list-item) {
    padding-inline-start: calc((var(--depth, 0) * 32px) + 12px);
  }
  .tree-view :global(.list-item .text-block) {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tree-view {
    max-block-size: 100%;
    min-block-size: 0;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .tree-view.collapsed::-webkit-scrollbar {
    width: 0px;
    background: transparent; /* make scrollbar transparent */
  }
  .tree-view :global(.category-header) {
    inline-size: 100%;
    padding-inline: 16px;
    padding-block: 10px;
  }
  .tree-view :global(.tree-view) {
    flex-grow: 0;
  }
  hr {
    margin: 6px 0;
    border: none;
    border-bottom: 1px solid var(--fds-subtle-fill-secondary);
  }
  .footer {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    margin-bottom: 5px;
  }
  .tree-view :global(.listitem.compact) {
    margin-top: 1px;
    margin-bottom: 1px;
    block-size: 30px;
  }

  .label-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .scope {
    padding: 3px 5px;
    font-family: var(--font-detail);
    font-size: 0.72rem;
    font-weight: 500;
    white-space: nowrap;
    box-shadow: var(--color-neutral-light-300) 0px 0px 0px 1.25px inset;
    border-radius: var(--radius);
    color: var(--color-neutral-light-1200);
    height: 20px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
  }
  @media (prefers-color-scheme: dark) {
    .scope {
      color: var(--color-neutral-dark-1200);
      box-shadow: var(--color-neutral-dark-300) 0px 0px 0px 1.25px inset;
    }
  }

  .tree-view :global(.person-picture-container) {
    margin-right: 8px;
  }
  .tree-view :global(.list-item.collapsed .person-picture-container) {
    margin-left: -4px;
  }

  .tree-view :global(.tree-view-collapsed-flyout .menu-flyout-anchor) {
    position: fixed;
    top: calc(var(--top) - 8px - var(--screenOffset));
    margin-left: 55px;
    max-height: calc(var(--maxHeight) - 16px - env(titlebar-area-height, 33px));
  }

  .tree-view :global(.tree-view-collapsed-flyout .menu-flyout-anchor .tree-view) {
    overflow: hidden;
  }

  .tree-view :global(.tree-view-collapsed-flyout .category-header) {
    box-sizing: border-box;
  }

  .tree-view :global(.tree-view-collapsed-flyout .listitem) {
    margin-right: 40px; /* add space at right side of menu */
  }

  .tree-view :global(.tree-view-collapsed-flyout .menu-flyout) {
    display: block;
    overflow-x: hidden;
    overflow-y: auto;
    max-height: calc(var(--maxHeight) - 16px - env(titlebar-area-height, 33px));
    height: 100%;
  }

  .tree-view :global(.tree-view-collapsed-flyout-button) {
    margin: 3px 5px;
    block-size: 34px;
    width: 40px;
  }
  .tree-view :global(.tree-view-collapsed-flyout-button.compact) {
    margin-top: 1px;
    margin-bottom: 1px;
    block-size: 30px;
  }
</style>
