<script lang="ts">
  import { browser } from '$app/environment';
  import { afterNavigate, goto, invalidate } from '$app/navigation';
  import { page } from '$app/stores';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { ActionRow } from '$lib/common/PageTitle';
  import PageTitle from '$lib/common/PageTitle/PageTitle.svelte';
  import { motionMode } from '$stores/motionMode';
  import { strapiEditor } from '$stores/strapiEditor';
  import { capitalize, hasKey } from '$utils';
  import {
    Button,
    MenuFlyout,
    MenuFlyoutDivider,
    MenuFlyoutItem,
    ProgressRing,
    TextBox,
    Tooltip,
  } from 'fluent-svelte';
  import { onMount } from 'svelte';
  import { expoOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';
  import CollectionTable from './CollectionTable.svelte';

  export let data;
  $: ({ collectionDocsData, userPermissions, collectionConfig } = data);

  $: collectionNameSingular = $collectionConfig.info.singularName || $collectionConfig.info.name;
  $: collectionNamePlural = $collectionConfig.info.pluralName || $collectionConfig.info.name || '';
  $: displayName = $collectionConfig.info.displayName.split('::').slice(-1)[0];

  $: pageTitle =
    // if defined, attempt to use the page title in the query string
    data.url.searchParams.get('__pageTitle') ||
    // otherwise, build a title using the collection name
    (displayName ? displayName : capitalize(collectionNamePlural.replaceAll('-', ' '))) +
      ' collection';

  // keep the search box value representative of the URL search params
  let searchBoxValue = calculateSearchBoxValue();
  afterNavigate(() => {
    searchBoxValue = calculateSearchBoxValue();
  });

  /**
   * Create a string for the search box that is representative of the
   * URL search params.
   */
  function calculateSearchBoxValue() {
    let str = Array.from(data.url.searchParams.entries())
      .filter(([key]) => {
        if (key.includes('__')) {
          return false;
        }
        if (key.includes('_')) {
          if (key === '_search') return true;
          return false;
        }
        return true;
      })
      .map(([key, value]) => {
        if (key === '_search') return value;
        return `${key}:${value}`;
      })
      .join(' ');

    // add space to the end of the string if there are only filters
    if (!data.url.searchParams.has('_search')) {
      str += ' ';
    }

    return str.trimStart();
  }

  /**
   * Updates the URL search params based on the search box value.
   */
  function setSearchFilters() {
    let filters = [];
    let search = '';
    searchBoxValue.match(/(?:[^\s"]+|"[^"]*")+/g)?.forEach((val) => {
      if (val.split(':').length > 1) {
        const splits = val.split(':');
        filters.push([splits[0], splits.slice(1).join(':')]);
      } else {
        search += ` ${val}`;
      }
    });
    if (search.trim().length > 0) filters.push(['_search', search.trim()]);

    const url = new URL(data.url.pathname, data.url.origin);
    filters.forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    Array.from(data.url.searchParams.entries()).forEach(([key, value]) => {
      if (key.includes('__') && key !== '__pageTitle') {
        url.searchParams.set(key, value);
      }
    });

    goto(url);
  }

  let refetching = false;
  let loadingMore = false;
  $: loading = refetching || loadingMore || $collectionDocsData.loading;

  // the document list layout for this collection
  $: persistedViewLayout =
    (browser && localStorage.getItem(`${$collectionConfig.apiID}:viewLayout`)) || '';
  onMount(() => {
    persistedViewLayout =
      (browser && localStorage.getItem(`${$collectionConfig.apiID}:viewLayout`)) || '';
  });
  let viewLayout: 'table' | 'grid';
  $: viewLayout =
    persistedViewLayout === 'grid' ? 'grid' : persistedViewLayout === 'table' ? 'table' : 'table';
  function setViewLayout(layout: typeof viewLayout) {
    localStorage.setItem(`${$collectionConfig.apiID}:viewLayout`, layout);
    viewLayout = layout;
  }

  // the details pane setting for this collection
  $: persistedDetailsPane =
    (browser && localStorage.getItem(`${$collectionConfig.apiID}:detailsPane`)) || '';
  onMount(() => {
    persistedDetailsPane =
      (browser && localStorage.getItem(`${$collectionConfig.apiID}:detailsPane`)) || '';
  });
  let detailsPane: boolean;
  $: detailsPane =
    persistedDetailsPane === 'true' ? true : persistedDetailsPane === 'false' ? false : false;
  function setDetailsPaneEnabled(enabled: typeof detailsPane) {
    localStorage.setItem(`${$collectionConfig.apiID}:detailsPane`, `${enabled}`);
    detailsPane = enabled;
  }

  $: canCreate = !!data.permissions?.find(
    ({ action }) => action === 'plugin::content-manager.explorer.create'
  );
  $: canCreateAndGet =
    canCreate &&
    !!data.permissions?.find(({ action }) => action === 'plugin::content-manager.explorer.read');

  // control whether the dropdown with view options is open or closed
  let viewDropdownOpen = false;
</script>

<div class="wrapper">
  <div class="header">
    {#key pageTitle}
      <div
        in:fly|global={{ y: 26, duration: $motionMode === 'reduced' ? 0 : 270, easing: expoOut }}
        style="
          margin: 32px 0 20px 0;
          min-height: 40px;
        "
      >
        <PageTitle fullWidth>
          {pageTitle}
        </PageTitle>
      </div>
    {/key}

    <ActionRow fullWidth>
      <Tooltip
        text={(() => {
          if (!canCreateAndGet) {
            return 'You do not have permission to create documents in this collection.';
          }
          return undefined;
        })()}
        offset={4}
        placement="bottom"
        alignment="start"
      >
        <Button
          variant="accent"
          disabled={!canCreate || loading || !canCreateAndGet}
          on:click={() => {
            if ($strapiEditor) {
              goto(`/poptart/content-manager/collection-types/${$collectionConfig.uid}/create`);
            } else {
              goto(`/poptart/cms/collection/${$collectionConfig.uid}/create`);
            }
            // createNewDocDialogCounter++;
            // setTimeout(() => {
            //   createNewDocDialogOpen = !createNewDocDialogOpen;
            // }, 1);
          }}
        >
          <FluentIcon name="DocumentAdd16Regular" mode="buttonIconLeft" />
          Create new {collectionNameSingular || 'document'}
        </Button>
      </Tooltip>

      <Button
        disabled={loading}
        on:click={async () => {
          refetching = true;
          await $collectionDocsData.refetch();
          refetching = false;
        }}
        style="width: 130px;"
      >
        {#if loading}
          <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
        {:else}
          <FluentIcon name="ArrowClockwise16Regular" mode="buttonIconLeft" />
          Refresh data
        {/if}
      </Button>

      <div style="display: flex;">
        <MenuFlyout alignment="start" placement="bottom" bind:open={viewDropdownOpen}>
          <svelte:fragment slot="flyout">
            <MenuFlyoutItem
              disabled={loading}
              on:click={async () => {
                refetching = true;
                await $collectionDocsData.refetch();
                refetching = false;
              }}
            >
              <FluentIcon name="ArrowClockwise16Regular" slot="icon" />
              Refresh data
            </MenuFlyoutItem>
            <MenuFlyoutDivider />
            {#if searchBoxValue.includes('archived:true')}
              <MenuFlyoutItem
                indented
                on:click={() => {
                  searchBoxValue = searchBoxValue.replace('archived:true', '');
                  setSearchFilters();
                }}
              >
                Exit {collectionNamePlural} archive
              </MenuFlyoutItem>
            {:else}
              <MenuFlyoutItem
                indented
                disabled
                on:click={() => {
                  searchBoxValue += 'archived:true';
                  setSearchFilters();
                }}
              >
                View archived {collectionNamePlural}
              </MenuFlyoutItem>
            {/if}
            <MenuFlyoutDivider />
            <MenuFlyoutItem cascading>
              <FluentIcon name="Grid16Regular" slot="icon" />
              Layout
              <svelte:fragment slot="flyout">
                <MenuFlyoutItem
                  indented={viewLayout !== 'grid'}
                  disabled
                  on:click={() => {
                    setViewLayout('grid');
                  }}
                >
                  {#if viewLayout === 'grid'}
                    <FluentIcon name="Checkmark16Regular" slot="icon" />
                  {/if}
                  Thumbnails
                </MenuFlyoutItem>
                <MenuFlyoutItem
                  indented={viewLayout !== 'table'}
                  on:click={() => {
                    setViewLayout('table');
                  }}
                >
                  {#if viewLayout === 'table'}
                    <FluentIcon name="Checkmark16Regular" slot="icon" />
                  {/if}
                  Details
                </MenuFlyoutItem>
              </svelte:fragment>
            </MenuFlyoutItem>
            <MenuFlyoutItem cascading>
              <FluentIcon name="PanelRight16Regular" slot="icon" />
              Details pane
              <svelte:fragment slot="flyout">
                <MenuFlyoutItem
                  indented={!detailsPane}
                  disabled
                  on:click={() => {
                    setDetailsPaneEnabled(true);
                  }}
                >
                  {#if !!detailsPane}
                    <FluentIcon name="Checkmark16Regular" slot="icon" />
                  {/if}
                  Show
                </MenuFlyoutItem>
                <MenuFlyoutItem
                  indented={!!detailsPane}
                  on:click={() => {
                    setDetailsPaneEnabled(false);
                  }}
                >
                  {#if !detailsPane}
                    <FluentIcon name="Checkmark16Regular" slot="icon" />
                  {/if}
                  Hide
                </MenuFlyoutItem>
              </svelte:fragment>
            </MenuFlyoutItem>
            <MenuFlyoutDivider />
            <MenuFlyoutItem disabled>
              <FluentIcon name="Filter16Regular" slot="icon" />
              Filter
            </MenuFlyoutItem>
            <MenuFlyoutItem
              on:click={() => {
                goto(data.url.pathname);
              }}
            >
              <FluentIcon name="FilterDismiss16Regular" slot="icon" />
              Clear filter
            </MenuFlyoutItem>
            <MenuFlyoutDivider />
            <MenuFlyoutItem
              disabled={!$userPermissions?.raw.find(
                ({ action }) => action === 'plugin::content-manager.collection-types.configure-view'
              )}
              on:click={() =>
                goto(
                  `/poptart/content-manager/collection-types/${$collectionConfig.uid}/configurations/list`
                )}
            >
              <FluentIcon name="Options16Regular" slot="icon" />
              Configure view
            </MenuFlyoutItem>
          </svelte:fragment>
        </MenuFlyout>
        <Button on:click={() => (viewDropdownOpen = !viewDropdownOpen)}>
          View
          <FluentIcon name="ChevronDown16Regular" mode="buttonIconRight" />
        </Button>
      </div>

      <TextBox
        placeholder="Search this collection"
        type="search"
        spellcheck="false"
        bind:value={searchBoxValue}
        on:keypress={(evt) => {
          if (hasKey(evt, 'key') && evt.key === 'Enter') {
            setSearchFilters();
          }
        }}
        on:search={() => {
          setSearchFilters();
        }}
      />
    </ActionRow>
  </div>

  <div class="explorer">
    <div class="new-table-wrapper explorer-main">
      <CollectionTable
        permissions={data.permissions || []}
        collectionConfig={data.collectionConfig}
        tableData={data.collectionDocsData}
        tableDataSort={data.table.sort}
        tableDataFilter={data.table.filters}
        bind:loadingMore
        on:sort={(evt) => {
          // backup the current sort in localstorage so it can be restored later
          localStorage.setItem(
            `table.${$collectionConfig.uid}.sort`,
            JSON.stringify(evt.detail.new)
          );

          if (JSON.stringify(evt.detail.old) !== JSON.stringify(evt.detail.new)) {
            invalidate('collection-table');
          }
        }}
      />
    </div>
    <div class="explorer-pane" />
  </div>
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .header :global(.text-box-container) {
    inline-size: auto !important;
    flex-grow: 1;
  }

  .explorer {
    display: flex;
    flex-direction: row;
    height: 100%;
    overflow: hidden;
    box-sizing: border-box;

    margin: 20px;
    --border-color: var(--color-neutral-light-200);
    box-shadow: 0 0 0 1px var(--border-color);
    border-radius: var(--fds-control-corner-radius);
  }

  @media (prefers-color-scheme: dark) {
    .explorer {
      --border-color: var(--color-neutral-dark-200);
    }
  }

  .explorer > div {
    height: 100%;
    overflow: hidden;
    box-sizing: border-box;
  }

  .explorer-main {
    flex-grow: 1;
  }

  .explorer-pane {
    flex-shrink: 0;
  }
</style>
