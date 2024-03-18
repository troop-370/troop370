<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { debounce, hasKey } from '$utils';
  import { Button, IconButton, TextBox } from 'fluent-svelte';
  import type { Writable } from 'svelte/store';
  import type { GetFileExplorerDataParams, getFileExplorerData } from './getFileExplorerData';

  export let path: Writable<GetFileExplorerDataParams['path']>;
  export let search: Writable<string>;
  export let store: Store | undefined;

  type Store = Awaited<ReturnType<typeof getFileExplorerData>>;

  $: breadcrumbs = $path.breadcrumbs.split('/').map((breadcrumb, index) => {
    return {
      label: index === 0 ? 'Media library' : breadcrumb,
      folderPath: $path.folderPath
        .split('/')
        .slice(0, index + 1)
        .join('/'),
      folderNumberPath: $path.folderNumberPath
        .split('/')
        .slice(0, index + 1)
        .join('/'),
      folder: parseInt($path.folderNumberPath.split('/')[index] || '0'),
    };
  });

  let searchValue = $search;
  const debouncedUpdateSearch = debounce(updateSearch, 300);
  function updateSearch(newSearch: string) {
    $search = newSearch;
  }

  let loading = false;
</script>

<div class="file-explorer-navigation">
  <IconButton disabled>
    <FluentIcon name="ArrowLeft16Regular" />
  </IconButton>

  <IconButton disabled>
    <FluentIcon name="ArrowRight16Regular" />
  </IconButton>

  <IconButton
    disabled={loading || breadcrumbs.length < 2}
    on:click={() => {
      $search = '';
      $path = {
        folder: breadcrumbs[breadcrumbs.length - 2].folder,
        folderPath: breadcrumbs[breadcrumbs.length - 2].folderPath,
        folderNumberPath: breadcrumbs[breadcrumbs.length - 2].folderNumberPath,
        breadcrumbs: breadcrumbs
          .slice(0, breadcrumbs.length - 1)
          .map((breadcrumb) => breadcrumb.label)
          .join('/'),
      };
    }}
  >
    <FluentIcon name="ArrowUp16Regular" />
  </IconButton>

  <IconButton
    disabled={loading}
    on:click={() => {
      loading = true;
      Promise.all([$store?.files.refetch(), $store?.folders.refetch()]).then(() => {
        loading = false;
      });
    }}
  >
    <FluentIcon name="ArrowClockwise16Regular" />
  </IconButton>

  <div class="breadcrumbs text-box-container">
    {#each breadcrumbs as breadcrumb, index}
      <Button
        disabled={loading}
        on:click={() => {
          $search = '';
          $path = {
            folder: breadcrumb.folder,
            folderPath: breadcrumb.folderPath,
            folderNumberPath: breadcrumb.folderNumberPath,
            breadcrumbs: $path.breadcrumbs
              .split('/')
              .slice(0, index + 1)
              .join('/'),
          };
        }}
      >
        {breadcrumb.label}
      </Button>
      {#if index < breadcrumbs.length - 1}
        <FluentIcon name="ChevronRight12Regular" />
      {/if}
    {/each}
  </div>

  <TextBox
    placeholder="Search {breadcrumbs.slice(-1)[0].label}"
    type="search"
    spellcheck="false"
    class="file-explorer-search"
    disabled={loading}
    bind:value={searchValue}
    on:keypress={(evt) => {
      if (hasKey(evt, 'key') && evt.key === 'Enter') {
        debouncedUpdateSearch(searchValue);
      }
    }}
    on:clear={() => debouncedUpdateSearch('')}
    on:search={() => debouncedUpdateSearch(searchValue)}
  />
</div>

<style>
  .file-explorer-navigation {
    display: flex;
    flex-direction: row;
    padding: 3px 0 10px 0;
  }

  .breadcrumbs {
    align-items: center;
    background-clip: padding-box;
    background-color: var(--fds-control-fill-default);
    border: 1px solid var(--fds-control-stroke-default);
    border-radius: var(--fds-control-corner-radius);
    cursor: text;
    display: flex;
    inline-size: 100%;
    position: relative;
    margin: 0 5px;
  }

  .breadcrumbs:not(:hover) :global(button) {
    background-color: transparent !important;
    box-shadow: none !important;
  }

  .breadcrumbs :global(svg) {
    fill: currentColor;
  }

  .breadcrumbs :global(button) {
    text-wrap: nowrap;
  }

  :global(.file-explorer-search) {
    width: 260px !important;
    flex-grow: 0;
    flex-shrink: 0;
  }
</style>
