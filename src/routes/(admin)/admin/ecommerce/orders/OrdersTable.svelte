<script lang="ts">
  import { goto } from '$app/navigation';
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

  $: options = writable<TableOptions<(typeof data)[0]>>({
    data: data,
    columns: columns,
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
        {@const href = `https://my.ecwid.com/store/18291121#order:id=${row.getValue('id')}`}
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
