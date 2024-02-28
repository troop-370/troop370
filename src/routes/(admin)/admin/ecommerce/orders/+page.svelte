<script lang="ts">
  import { afterNavigate, goto, invalidate } from '$app/navigation';
  import { page } from '$app/stores';
  import FieldWrapper from '$components/admin/FieldWrapper.svelte';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { ActionRow, PageTitle } from '$lib/common/PageTitle';
  import { motionMode } from '$stores/motionMode';
  import { hasKey } from '$utils';
  import { Button, Checkbox, ContentDialog, ProgressRing, TextBox } from 'fluent-svelte';
  import { expoOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';
  import { ordersSchema } from '../ecwidSchemas';
  import OrdersTable from './OrdersTable.svelte';
  import { fetchZip4s_client } from './fetchZip4s_client';

  export let data;
  $: ({ orders } = data);

  let refetching = false;
  let exporting = false;
  let loadingMore = false;
  $: loading = refetching || loadingMore || $orders.loading;

  let exportDialogOpen = false;
  let exportDialogZip4 = false;

  $: isPineStraw = $page.url.search.includes('148999309') || $page.url.search.includes('149009997');

  $: pageTitle =
    // if defined, attempt to use the page title in the query string
    $page.url.searchParams.get('__pageTitle') ||
    // otherwise, use the default title
    'Online store orders';

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
    let str = Array.from($page.url.searchParams.entries())
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
    if (!$page.url.searchParams.has('_search')) {
      str += ' ';
    }

    return str.trimStart();
  }

  /**
   * Updates the URL search params based on the search box value.
   */
  function setSearchFilters() {
    $orders = { total: 0, count: 0, offset: 0, limit: 100, items: [], loading: true };

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

    const url = new URL($page.url.pathname, $page.url.origin);
    filters.forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    Array.from($page.url.searchParams.entries()).forEach(([key, value]) => {
      if (key.includes('__') && key !== '__pageTitle') {
        url.searchParams.set(key, value);
      }
    });

    return goto(url);
  }

  async function fetchMore() {
    $orders = { ...$orders, loading: true };

    const searchParams = new URLSearchParams($page.url.search);
    searchParams.set('offset', $orders.items.length.toString());

    const nextOrders = await fetch(`?${searchParams}`)
      .then((res) => res.json() as unknown as typeof data.orders)
      .then((json) => ordersSchema.parse(json))
      .then(({ items }) => items);

    const newItems = [...$orders.items, ...nextOrders];

    if (nextOrders)
      $orders = {
        total: $orders.total,
        count: newItems.length,
        offset: $orders.items.length,
        limit: 100,
        items: newItems,
        loading: false,
      };
  }
</script>

<div class="wrapper">
  <div class="header">
    {#key pageTitle}
      <div
        in:fly={{ y: 26, duration: $motionMode === 'reduced' ? 0 : 270, easing: expoOut }}
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
      <Button
        variant="accent"
        disabled={loading}
        on:click={() => {
          goto('/admin/ecommerce/orders/new');
        }}
      >
        <FluentIcon name="Add16Regular" mode="buttonIconLeft" />
        Add manual order
      </Button>

      <Button disabled={loading} on:click={() => (exportDialogOpen = !exportDialogOpen)}>
        <FluentIcon name="ArrowDownload16Regular" mode="buttonIconLeft" />
        Export to csv
      </Button>

      <Button
        disabled={loading}
        on:click={async () => {
          $orders = { total: 0, count: 0, offset: 0, limit: 100, items: [], loading: true };
          await invalidate('order-table');
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

      <TextBox
        placeholder="Search all orders"
        type="search"
        spellcheck="false"
        bind:value={searchBoxValue}
        on:keypress={(evt) => {
          if (hasKey(evt, 'key') && evt.key === 'Enter') {
            setSearchFilters();
          }
        }}
        on:search={setSearchFilters}
      />
    </ActionRow>
  </div>
  <div class="explorer">
    <div class="new-table-wrapper explorer-main">
      <OrdersTable data={$orders.items} totalDocs={$orders.total} {fetchMore} {loading} />
    </div>
  </div>
</div>

<ContentDialog
  title="Export as CSV"
  bind:open={exportDialogOpen}
  on:close={() => {
    exportDialogZip4 = false;
  }}
>
  {#if isPineStraw}
    <FieldWrapper label="ZIP+4" forId="zip4">
      <Checkbox id="zip4" bind:checked={exportDialogZip4}>
        Download ZIP+4 for each order (may take a while)
      </Checkbox>
    </FieldWrapper>
  {/if}

  <svelte:fragment slot="footer">
    <Button
      slot="footer"
      variant="accent"
      on:click={() => {
        exporting = true;
        const searchParams = new URLSearchParams($page.url.search);
        searchParams.set('all', 'true');
        searchParams.set('as', 'csv');
        searchParams.set('zip4', exportDialogZip4 ? '1' : '0');
        fetch(`?${searchParams}`)
          .then((res) => res.text())
          .then(async (csv) => {
            const fullCsv = exportDialogZip4 ? await fetchZip4s_client(fetch, csv) : csv;

            const hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(fullCsv);
            hiddenElement.target = '_blank';
            hiddenElement.download = `orders_${new Date().toISOString()}.csv`;
            hiddenElement.click();
          })
          .finally(() => {
            exportDialogOpen = false;
            exporting = false;
          });
      }}
      disabled={loading}
    >
      {#if exporting}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        Export to csv
      {/if}
    </Button>
    <Button slot="footer" on:click={() => (exportDialogOpen = false)} disabled={loading}>
      Cancel
    </Button>
  </svelte:fragment>
</ContentDialog>

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
</style>
