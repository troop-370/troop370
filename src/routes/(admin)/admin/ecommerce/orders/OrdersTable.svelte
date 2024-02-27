<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { StatelessCheckbox } from '$lib/common/Checkbox';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import Loading from '$lib/common/Loading.svelte';
  import { compactMode } from '$stores/compactMode';
  import { motionMode } from '$stores/motionMode';
  import { formatISODate } from '$utils/formatISODate';
  import { hasKey } from '$utils/hasKey';
  import {
    createSvelteTable,
    flexRender,
    getCoreRowModel,
    type Column,
    type ColumnDef,
    type TableOptions,
  } from '@tanstack/svelte-table';
  import { Button } from 'fluent-svelte';
  import { expoOut } from 'svelte/easing';
  import { writable } from 'svelte/store';
  import { fly } from 'svelte/transition';
  import type { z } from 'zod';
  import type { orderEntrySchema } from '../ecwidSchemas';

  export let data: z.infer<typeof orderEntrySchema>[];
  export let loading = false;
  export let fetchMore: (() => Promise<void>) | undefined = undefined;
  export let totalDocs: number | undefined = undefined;

  const columns: ColumnDef<(typeof data)[0]>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: (info) => {
        return info.getValue();
      },
      size: 50,
      enableSorting: false,
      meta: {
        justify: 'left',
      },
    },
    {
      accessorKey: 'billingPerson.name',
      header: 'Ordered by',
      cell: (info) => {
        return info.getValue();
      },
      size: 200,
      enableSorting: false,
      meta: {
        justify: 'left',
      },
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Payment status',
      cell: (info) => {
        return info.getValue().toLowerCase();
      },
      size: 140,
      enableSorting: false,
    },
    {
      accessorKey: 'fulfillmentStatus',
      header: 'Fulfillment status',
      cell: (info) => {
        return info.getValue().toLowerCase();
      },
      size: 200,
      enableSorting: false,
    },
    {
      accessorKey: 'items',
      header: 'Items',
      cell: (info) => {
        return info.getValue().length;
      },
      size: 70,
      enableSorting: false,
      meta: {
        justify: 'left',
      },
    },
    {
      accessorKey: 'items',
      header: 'Item names',
      cell: (info) => {
        return info
          .getValue()
          .map((item) => item.name)
          .join(', ');
      },
      size: 300,
      enableSorting: false,
      meta: {
        justify: 'left',
      },
    },
    {
      accessorKey: 'createDate',
      header: 'Ordered at',
      cell: (info) => {
        return formatISODate((info.getValue() as Date).toISOString(), false, true, true);
      },
      size: 200,
      enableSorting: false,
      meta: {
        justify: 'left',
      },
    },
  ];

  $: isPineStraw = $page.url.search.includes('148999309') || $page.url.search.includes('149009997');
  const bales = (d) => d.productId === 149009997;
  const spread = (d) => d.productId === 148999309;
  const pineStrawColumns: ColumnDef<(typeof data)[0]>[] = [
    {
      accessorKey: '_',
      header: 'Delivery code',
      cell: (info) => {
        const pinestrawItem = info.row.original.items.find(bales);
        const spreadItem = info.row.original.items.find(spread);
        return `P-${pinestrawItem?.quantity || 0}${spreadItem ? '-SPREAD-' : ''}${
          spreadItem?.quantity || 0
        }`;
      },
      size: 150,
      enableSorting: false,
    },
    {
      accessorKey: '_',
      header: 'Address',
      cell: (info) => {
        const isShipping = info.row.original.shippingOption?.fulfillmentType === 'SHIPPING';
        if (!isShipping) return 'PICK UP';

        const shippingPerson = info.row.original.shippingPerson;
        if (!shippingPerson) return '';

        return (
          shippingPerson.street +
          ', ' +
          shippingPerson.city +
          ', ' +
          shippingPerson.stateOrProvinceCode +
          ', ' +
          shippingPerson.postalCode
        );
      },
      size: 350,
      enableSorting: false,
    },
    {
      accessorKey: 'createDate',
      header: 'Date received',
      cell: (info) => {
        return formatISODate(info.getValue().toISOString(), false, true, false);
      },
      size: 200,
      enableSorting: false,
      meta: {
        justify: 'left',
      },
    },
    {
      accessorKey: 'billingPerson.name',
      header: 'Ordered by',
      cell: (info) => {
        return info.getValue();
      },
      size: 200,
      enableSorting: false,
      meta: {
        justify: 'left',
      },
    },
    {
      accessorKey: 'id',
      header: 'Online store order no.',
      cell: (info) => {
        return info.getValue();
      },
      size: 160,
      enableSorting: false,
      meta: {
        justify: 'left',
      },
    },
    {
      accessorKey: 'billingPerson.phone',
      header: 'Phone number',
      cell: (info) => {
        return info.getValue() || '';
      },
      size: 160,
      enableSorting: false,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: (info) => {
        return info.getValue();
      },
      size: 240,
      enableSorting: false,
    },
    {
      accessorKey: '_',
      header: 'Street address',
      cell: (info) => {
        const isShipping = info.row.original.shippingOption?.fulfillmentType === 'SHIPPING';
        if (!isShipping) return '';

        const shippingPerson = info.row.original.shippingPerson;
        if (!shippingPerson) return '';

        return shippingPerson.street;
      },
      size: 250,
      enableSorting: false,
    },
    {
      accessorKey: '_',
      header: 'ZIP',
      cell: (info) => {
        const isShipping = info.row.original.shippingOption?.fulfillmentType === 'SHIPPING';
        if (!isShipping) return '';

        const shippingPerson = info.row.original.shippingPerson;
        if (!shippingPerson) return '';

        return shippingPerson.postalCode.slice(0, 5);
      },
      size: 80,
      enableSorting: false,
    },
    {
      accessorKey: '_',
      header: 'ZIP+4',
      cell: (info) => {
        const isShipping = info.row.original.shippingOption?.fulfillmentType === 'SHIPPING';
        if (!isShipping) return '';

        const shippingPerson = info.row.original.shippingPerson;
        if (!shippingPerson) return '';

        return '';
      },
      size: 80,
      enableSorting: false,
    },
    {
      accessorKey: '_',
      header: 'Bales',
      cell: (info) => {
        const pinestrawItem = info.row.original.items.find(bales);
        if (!pinestrawItem) return '';

        return pinestrawItem.quantity;
      },
      size: 60,
      enableSorting: false,
    },
    {
      accessorKey: '_',
      header: 'Bale cost',
      cell: (info) => {
        const pinestrawItem = info.row.original.items.find(bales);
        if (!pinestrawItem) return '';

        return `$ ${pinestrawItem.productPrice.toFixed(2)}`;
      },
      size: 80,
      enableSorting: false,
    },
    {
      accessorKey: '_',
      header: 'Pine straw cost',
      cell: (info) => {
        const pinestrawItem = info.row.original.items.find(bales);
        if (!pinestrawItem) return '';

        return `$ ${(pinestrawItem.quantity * pinestrawItem.productPrice).toFixed(2)}`;
      },
      size: 120,
      enableSorting: false,
    },
    {
      accessorKey: '_',
      header: 'Paypal cost',
      cell: () => {
        return '';
      },
      size: 90,
      enableSorting: false,
    },
    {
      accessorKey: '_',
      header: 'Delivery fee',
      cell: (info) => {
        const shippingRate = info.row.original.shippingOption?.shippingRate;
        if (!shippingRate) return '';
        return `$ ${(shippingRate || 0).toFixed(2)}`;
      },
      size: 90,
      enableSorting: false,
    },
    {
      accessorKey: '_',
      header: 'Spread out?',
      cell: (info) => {
        const spreadItem = info.row.original.items.find(spread);
        return spreadItem ? 'YES' : '';
      },
      size: 120,
      enableSorting: false,
    },
    {
      accessorKey: '_',
      header: 'Spead out cost per bale',
      cell: (info) => {
        const spreadItem = info.row.original.items.find(spread);
        if (!spreadItem) return '';
        return `$ ${spreadItem.productPrice}`;
      },
      size: 170,
      enableSorting: false,
    },
    {
      accessorKey: '_',
      header: 'No. bales spread out',
      cell: (info) => {
        const spreadItem = info.row.original.items.find(spread);
        if (!spreadItem) return '';
        return spreadItem.quantity;
      },
      size: 160,
      enableSorting: false,
    },
    {
      accessorKey: '_',
      header: 'Total cost spread out',
      cell: (info) => {
        const spreadItem = info.row.original.items.find(spread);
        if (!spreadItem) return '';
        return `$ ${(spreadItem.quantity * spreadItem.productPrice).toFixed(2)}`;
      },
      size: 150,
      enableSorting: false,
    },
    {
      accessorKey: '_',
      header: 'Donation',
      cell: (info) => {
        return '';
      },
      size: 120,
      enableSorting: false,
    },
    {
      accessorKey: '_',
      header: 'Total',
      cell: (info) => {
        const pinestrawItem = info.row.original.items.find(bales);
        const spreadItem = info.row.original.items.find(spread);
        const psCost = pinestrawItem ? pinestrawItem?.quantity * pinestrawItem?.productPrice : 0;
        const spCost = spreadItem ? spreadItem?.quantity * spreadItem?.productPrice : 0;
        return `$ ${(psCost + spCost).toFixed(2)}`;
      },
      size: 150,
      enableSorting: false,
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Paid?',
      cell: (info) => {
        return info.getValue() === 'PAID' ? 'Yes' : 'NO';
      },
      size: 80,
      enableSorting: false,
    },
  ];

  $: options = writable<TableOptions<(typeof data)[0]>>({
    data: data,
    columns: isPineStraw ? pineStrawColumns : columns,
    getCoreRowModel: getCoreRowModel(),
    debugAll: false,
    enableSorting: true,
    enableMultiSort: true,
    manualSorting: true,
    manualFiltering: true,
    meta: {
      compactMode: $compactMode,
      noWrap: $compactMode,
    },
    initialState: {
      // sorting: Object.entries(JSON.parse(sort) as typeof tableDataSort).map(([field, direction]) => {
      //   return {
      //     id: field,
      //     desc: direction === -1,
      //   };
      // }),
    },
  });

  $: table = createSvelteTable(options);

  function toggleSort(column: Column<(typeof data)[0]>, sortable: boolean, shiftKey?: boolean) {
    if (sortable) column.toggleSorting(undefined, shiftKey);
  }

  let loadingMore = false;
</script>

<div class="wrapper">
  <div role="table" class:compact={$table.options.meta?.compactMode}>
    <div role="rowgroup" class="thead">
      {#each $table.getHeaderGroups() as headerGroup}
        <div role="row">
          {#each headerGroup.headers as header}
            {@const sortable = header.column.getCanSort()}
            {@const columnSize = header.getSize() === 9999 ? '100%' : header.getSize() + 'px'}
            {@const meta = header.column.columnDef.meta || {}}
            {@const justify = hasKey(meta, 'justify') ? meta.justify : 'left'}
            <span
              role="columnheader"
              style="
                width: {columnSize};
                flex-shrink: {columnSize === '100%' ? '1' : '0'};
                justify-content: {justify};
              "
              class:sortable
              class:rightPadding={justify === 'right'}
              tabindex="0"
              on:keyup={(evt) => {
                if (evt.key === 'Enter') toggleSort(header.column, sortable, evt.shiftKey);
              }}
              on:click={(evt) => toggleSort(header.column, sortable, evt.shiftKey)}
            >
              {#if header.id === '__checkbox'}
                <StatelessCheckbox
                  checked={$table.getIsAllRowsSelected()}
                  indeterminate={$table.getIsSomeRowsSelected()}
                  size={$compactMode ? 16 : 18}
                  labelStyle="display: flex; margin-left: 3px;"
                  disabled={$table.getRowModel().rows.length === 0}
                  on:click={(evt) => {
                    evt.stopPropagation();
                  }}
                  on:change={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    $table.toggleAllRowsSelected();
                  }}
                />
              {:else if !header.isPlaceholder}
                <svelte:component
                  this={flexRender(header.column.columnDef.header, header.getContext())}
                />
                {#if sortable}
                  <span class="sort-chevron" style="--width: {columnSize}">
                    {#if header.column.getIsSorted() === 'asc'}
                      <FluentIcon name="ChevronUp16Regular" />
                    {:else if header.column.getIsSorted() === 'desc'}
                      <FluentIcon name="ChevronDown16Regular" />
                    {/if}
                  </span>
                {/if}
              {/if}
            </span>
          {/each}
        </div>
      {/each}
    </div>
    <div role="rowgroup" class="tbody">
      {#each $table.getRowModel().rows as row, i}
        {@const href = `/admin/ecommerce/orders/${row.getValue('id')}`}
        {#key href}
          <a
            role="row"
            {href}
            on:click={() => goto(href)}
            in:fly={{ y: 40, duration: $motionMode === 'reduced' ? 0 : 270, easing: expoOut }}
          >
            {#each row.getVisibleCells() as cell}
              {@const columnSize =
                cell.column.getSize() === 9999 ? '100%' : cell.column.getSize() + 'px'}
              {@const meta = cell.column.columnDef.meta || {}}
              {@const justify = hasKey(meta, 'justify') ? meta.justify : 'left'}
              <span
                role="cell"
                style="
                  width: {columnSize};
                  flex-shrink: {columnSize === '100%' ? '1' : '0'};
                  justify-content: {justify};
                "
                class:rightPadding={justify === 'right'}
              >
                {#if cell.column.id === '__checkbox'}
                  <!-- <StatelessCheckbox
                    checked={row.getIsSelected()}
                    disabled={!row.getCanSelect()}
                    indeterminate={row.getIsSomeSelected()}
                    size={$compactMode ? 16 : 18}
                    labelStyle="display: flex; margin-left: 3px;"
                    on:click={(evt) => {
                      evt.stopPropagation();
                    }}
                    on:change={(evt) => {
                      row.toggleSelected(evt.detail.checked);
                      lastSelectedRowIndex = row.index;
                    }}
                  /> -->
                {:else}
                  <span class="cell-content" class:noWrap={$table.options.meta?.noWrap}>
                    <svelte:component
                      this={flexRender(cell.column.columnDef.cell, cell.getContext())}
                    />
                  </span>
                {/if}
              </span>
            {/each}
          </a>
        {/key}
      {/each}
    </div>
  </div>
  {#if data.length === 0 && loading}
    <Loading message="Loading documents..." style="padding: 20px;" />
  {/if}
  {#if fetchMore && (totalDocs || 0) > data.length}
    <div class="table-buttons">
      {#if loadingMore}
        <Loading message="Loading more..." />
      {:else}
        <Button
          on:click={async () => {
            if (data) {
              loadingMore = true;
              await fetchMore?.();
              loadingMore = false;
            }
          }}
        >
          Load more
        </Button>
      {/if}
    </div>
  {/if}
</div>

<style>
  div.wrapper {
    --border-color: var(--color-neutral-light-200)
    border: 1px solid var(--fds-divider-stroke-default);
    box-shadow: 0 0 0 1px var(--border-color);
    border-radius: var(--fds-control-corner-radius);
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  @media (prefers-color-scheme: dark) {
    div.wrapper {
      --border-color: var(--color-neutral-dark-200);
    }
  }

  div[role='table'] {
    width: 100%;
    font-family: var(--fds-font-family-text);
    font-size: var(--fds-body-font-size);
    font-weight: 400;
    line-height: 20px;
  }

  

  /* row style */
  [role='row'] {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-start;
  }
  a[role='row'] {
    text-decoration: none;
    color: inherit;
    cursor: default;
  }
  a[role='row']:hover {
    background-color: var(--fds-subtle-fill-secondary);
  }
  a[role='row']:active {
    background-color: var(--fds-subtle-fill-tertiary);
    color: var(--fds-text-secondary);
  }

  /* row size */
  div[role='rowgroup'] [role="row"] {
    min-height: 40px;
    height: unset;
  }
  div[role='table'].compact div[role='rowgroup'] [role="row"] {
    min-height: 30px;
    height: 30px;
  }

  /* header row */
  div[role='rowgroup'].thead div[role="row"] {
    border-bottom: 1px solid var(--border-color);
    min-height: 42px;
    height: 42px;
  }
  div[role='rowgroup'].thead {
    position:sticky;
    top: 0;
    background-color: #ffffff;
    z-index: 1;
  }
  @media (prefers-color-scheme: dark) {
    div[role='rowgroup'].thead {
      background-color: #272727;
    }
  }
  div[role='table'].compact div[role='rowgroup'].thead div[role="row"] {
    min-height: 36px;
  }

  /* cell */
  span[role='columnheader'], span[role='cell'] {
    padding: 4px 0 4px 10px;
    box-sizing: border-box;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  span[role='columnheader'].rightPadding, span[role='cell'].rightPadding {
    padding-right: 10px;
  }

  /* header sorting */
  span[role='columnheader'].sortable {
    position: relative;
    cursor: pointer;
  }
  span[role='columnheader'].sortable:hover {
    background-color: var(--fds-subtle-fill-secondary);
  }
  span[role='columnheader'].sortable:active {
    background-color: var(--fds-subtle-fill-tertiary);
    color: var(--fds-text-secondary);
  }
  .sort-chevron {
    position: absolute;
    top: 0;
    left: calc(var(--width) / 2 - 16px);
    width: 16px;
    height: 16px;
  }
  .sort-chevron > :global(svg) {
    fill: currentColor
  }
  
  /* disable text wrapping of cell content when compact mode is enabled */
  span[role='cell'] {
    overflow: hidden;
  }
  span.cell-content {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  span.cell-content.noWrap {
    white-space: nowrap;
  }

  /* table load more button */
  .table-buttons {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 10px
  }
</style>
