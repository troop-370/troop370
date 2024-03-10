<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { StatelessCheckbox } from '$lib/common/Checkbox';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import Loading from '$lib/common/Loading.svelte';
  import { compactMode } from '$stores/compactMode';
  import { motionMode } from '$stores/motionMode';
  import { isIsoDate, isShortIsoDate, notEmpty } from '$utils';
  import { hasKey } from '$utils/hasKey';
  import {
    createSvelteTable,
    flexRender,
    getCoreRowModel,
    renderComponent,
    type Column,
    type ColumnDef,
    type Row,
    type TableOptions,
  } from '@tanstack/svelte-table';
  import { Button } from 'fluent-svelte';
  import { createEventDispatcher } from 'svelte';
  import { expoOut } from 'svelte/easing';
  import { writable } from 'svelte/store';
  import { fly } from 'svelte/transition';
  import type { PageData } from './$types';
  import BulkActions from './BulkActions.svelte';
  import ValueCell from './ValueCell.svelte';
  import { selectedIds } from './selectedIdsStore';

  export let settings: NonNullable<PageData['settings']>;
  export let collectionConfig: NonNullable<PageData['collectionConfig']>;
  export let permissions: NonNullable<PageData['permissions']>;
  export let tableData: PageData['collectionDocsData'];
  export let tableDataFilter: NonNullable<PageData['table']>['filter'];
  export let tableDataSort: NonNullable<PageData['table']>['sort'];

  const filterJSON = JSON.stringify(tableDataFilter);

  type Doc = NonNullable<NonNullable<typeof $tableData.data>['docs']>[0];

  // row links behaviors
  $: links = {
    href: `/admin/content-manager/collection-types/${settings.uid}`,
    hrefSuffixKey: 'id',
    hrefSearch: undefined,
    windowName: `editor-troop-370-${settings.uid}-`,
  };

  let columns: ColumnDef<Doc>[] = [];
  $: columns = [
    {
      accessorKey: '__checkbox',
      cell: (info) => {
        return renderComponent(ValueCell, {
          info,
          type: 'checkbox',
          key: '__checkbox',
          def: { type: 'Boolean' },
        });
      },
      size: 42,
      enableSorting: false,
    },
    ...($collectionConfig?.contentType.layouts.list || [])
      .map((key) => {
        if (['id', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy'].includes(key)) return null;

        const sortable = $collectionConfig?.contentType.metadatas[key]?.list?.sortable;
        const label = $collectionConfig?.contentType.metadatas[key]?.list?.label;

        return {
          header: label || key,
          accessorKey: key,
          cell: (info) => {
            return renderComponent(ValueCell, {
              info,
              key: key,
              def: {
                type: isIsoDate(info.getValue(key))
                  ? 'date'
                  : isShortIsoDate(info.getValue(key))
                  ? 'shortdate'
                  : 'passthrough',
              },
            });
          },
          size:
            key === 'title' || key === 'name'
              ? 360
              : key === 'subtitle'
              ? 300
              : key.endsWith('At')
              ? 190
              : 160,
          enableSorting: sortable,
        };
      })
      .filter(notEmpty),
    {
      header: 'Stage',
      accessorKey: '__stage',
      cell: (info) => {
        const publishedAt = info.row.original.publishedAt;
        const stageName = info.row.original.strapi_stage?.name;
        return renderComponent(ValueCell, {
          info,
          key: 'updatedBy',
          def: {
            type: 'passthrough',
            column: {
              chips: [
                { value: 'Published', color: 'green' },
                { value: 'Draft', color: 'neutral' },
                { value: 'stage__Planning', label: 'Planning', color: 'indigo' },
                { value: 'stage__Draft', label: 'Draft', color: 'orange' },
                { value: 'stage__In review', label: 'In review', color: 'red' },
                { value: 'stage__Ready', label: 'Ready', color: 'blue' },
              ],
            },
          },
          valueOverride: (() => {
            if (publishedAt) return 'Published';
            if (stageName) return 'stage__' + stageName;
            return 'Draft';
          })(),
        });
      },
      size: 120,
      enableSorting: false,
    },
    {
      header: 'Created by',
      accessorKey: 'createdBy',
      id: 'createdBy',
      cell: (info) =>
        renderComponent(ValueCell, {
          info,
          key: 'createdBy',
          def: { type: 'user' },
        }),
      size: 150,
      enableSorting: false,
    },
    // {
    //   header: 'Created',
    //   accessorKey: 'createdAt',
    //   id: 'createdAt',
    //   cell: (info) => renderComponent(ValueCell, { info, key: 'createdAt', def: { type: 'date' } }),
    //   size: 190,
    //   enableSorting: false,
    // },
    {
      header: 'Last modified by',
      accessorKey: 'updatedBy',
      id: 'updatedBy',
      cell: (info) =>
        renderComponent(ValueCell, {
          info,
          key: 'updatedBy',
          def: { type: 'user' },
        }),
      size: 150,
      enableSorting: false,
    },
    {
      header: 'Last modified',
      accessorKey: 'updatedAt',
      id: 'updatedAt',
      cell: (info) => renderComponent(ValueCell, { info, key: 'updatedAt', def: { type: 'date' } }),
      size: 190,
      enableSorting: true,
    },
    {
      header: 'ID',
      accessorKey: 'id',
      id: 'id',
      cell: (info) => renderComponent(ValueCell, { info, key: 'id', def: { type: 'passthrough' } }),
      size: 80,
      enableSorting: true,
    },
  ];

  let colName = settings.apiID;
  let data: Doc[] = [];
  // let filter = JSON.stringify(tableDataFilter);
  let sort = JSON.stringify(tableDataSort);
  $: {
    if (
      data.length !== ($tableData.data?.docs || []).length ||
      colName !== settings.apiID ||
      // filter !== JSON.stringify(tableDataFilter) ||
      sort !== JSON.stringify(tableDataSort)
    ) {
      data = $tableData.data?.docs || [];
      colName = settings.apiID;
      // filter = JSON.stringify(tableDataFilter);
      sort = JSON.stringify(tableDataSort);
    }
  }

  $: options = writable<TableOptions<Doc>>({
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
      sorting: Object.entries(JSON.parse(sort) as typeof tableDataSort).map(
        ([field, direction]) => {
          return {
            id: field,
            desc: direction === -1,
          };
        }
      ),
    },
  });

  $: table = createSvelteTable(options);

  // dispatch sort event when sort changes
  const dispatch = createEventDispatcher();
  $: {
    const newSort: Record<string, 1 | -1> = {};
    $table.getState().sorting.map((value) => {
      newSort[value.id] = value.desc ? -1 : 1;
    });
    dispatch('sort', {
      old: JSON.parse(sort) as typeof tableDataSort,
      new: newSort,
    });
  }

  function handleRowClick(evt: PointerEvent | MouseEvent, row: Row<Doc>) {
    const lastRowIndex = lastSelectedRowIndex;
    const thisRowIndex = row.index;

    if (
      ((isPointerEvent(evt) && evt.pointerType === 'mouse') || !isPointerEvent(evt)) &&
      !isInputElem(evt.target) &&
      !isCheckbox(evt.target)
    ) {
      // disable navigating by anchor tag on single click (use double click or enter or middle click instead)
      evt.preventDefault();

      // if control clicking, select with deselecting other rows
      if (evt.ctrlKey) {
        row.toggleSelected();
      }
      // if shift clicking, deselect all and then select all from this row to last selected row
      else if (evt.shiftKey) {
        $table.toggleAllRowsSelected(false);
        if (lastRowIndex > thisRowIndex) {
          $table
            .getRowModel()
            .rows.filter((row) => row.index >= thisRowIndex && row.index <= lastRowIndex)
            .forEach((row) => {
              row.toggleSelected(true);
            });
        } else if (lastRowIndex <= thisRowIndex) {
          $table
            .getRowModel()
            .rows.filter((row) => row.index <= thisRowIndex && row.index >= lastRowIndex)
            .forEach((row) => {
              row.toggleSelected(true);
            });
        }
      }
      // otherise, deselect all rows before selecting this row
      else {
        $table.toggleAllRowsSelected(false);
        row.toggleSelected();
      }
      // update the last selected row index once we are done
      lastSelectedRowIndex = thisRowIndex;
    }
    evt.stopPropagation();
  }

  function isPointerEvent(evt: PointerEvent | MouseEvent): evt is PointerEvent {
    if (hasKey(evt, 'pointerType')) return true;
    return false;
  }

  function isInputElem(target: EventTarget | null): target is HTMLInputElement {
    return !!target && hasKey(target, 'nodeName') && target.nodeName === 'INPUT';
  }

  function isCheckbox(target: EventTarget | null): target is Element {
    if (!target) return false;

    if (hasKey(target, 'class') && typeof target.class === 'string') {
      return target.class.includes('checkbox');
    }
    if (hasKey(target, 'nodeName')) {
      return target.nodeName === 'INPUT' || target.nodeName === 'svg' || target.nodeName === 'path';
    }

    return false;
  }

  let lastSelectedRowIndex = 0;
  $: $selectedIds = $table.getSelectedRowModel().rows.map((row) => row.original.id) as number[];

  function toggleSort(column: Column<Doc>, sortable: boolean, shiftKey?: boolean) {
    if (sortable) column.toggleSorting(undefined, shiftKey);
  }

  export let loadingMore = false;
</script>

<div class="wrapper">
  <div role="table" class:compact={$table.options.meta?.compactMode}>
    <div role="rowgroup" class="thead">
      {#each $table.getHeaderGroups() as headerGroup}
        <div role="row">
          {#each headerGroup.headers as header}
            {@const sortable = header.column.getCanSort()}
            <span
              role="columnheader"
              style="width: {header.getSize()}px;"
              class:sortable
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
                  <span class="sort-chevron" style="--width: {header.getSize()}px">
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
        {@const href = `${links.href}/${row.original?.[links.hrefSuffixKey]}${
          links.hrefSearch || ''
        }`}
        {#key href + filterJSON}
          <a
            role="row"
            {href}
            on:click={(evt) => handleRowClick(evt, row)}
            on:dblclick={(evt) => {
              if (!isInputElem(evt.target) && !isCheckbox(evt.target)) goto(href);
            }}
            in:fly={{ y: 40, duration: $motionMode === 'reduced' ? 0 : 270, easing: expoOut }}
          >
            {#each row.getVisibleCells() as cell}
              <span role="cell" style="width: {cell.column.getSize()}px">
                {#if cell.column.id === '__checkbox'}
                  <StatelessCheckbox
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
                  />
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
  {#if ($tableData.data?.totalDocs || 0) === 0 && $tableData.loading}
    <Loading message="Loading documents..." style="padding: 20px;" />
  {/if}
  {#if ($tableData.data?.totalDocs || 0) > ($tableData.data?.docs || []).length}
    <div class="table-buttons">
      {#if loadingMore}
        <Loading message="Loading more..." />
      {:else}
        <Button
          on:click={() => {
            if ($tableData?.data?.docs) {
              loadingMore = true;
              $tableData
                .fetchNextPage($tableData.data?.page)
                .then(({ current, next, setStore }) => {
                  if (current && next) {
                    const allDocs = [...(current.docs || []), ...(next.docs || [])];
                    setStore({
                      ...current,
                      docs: allDocs,
                      totalDocs: current.totalDocs,
                    });
                    loadingMore = false;
                  }
                });
            }
          }}
        >
          Load more
        </Button>
      {/if}
    </div>
  {/if}
</div>

{#if settings}
  <div style="position: relative;">
    <BulkActions {settings} {tableData} />
  </div>
{/if}

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
    width: fit-content;
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
