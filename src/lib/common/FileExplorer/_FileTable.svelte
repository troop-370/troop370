<script lang="ts">
  import { StatelessCheckbox } from '$lib/common/Checkbox';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { compactMode } from '$stores/compactMode';
  import { motionMode } from '$stores/motionMode';
  import type { paramsToStrapiFilter } from '$utils';
  import { hasKey } from '$utils/hasKey';
  import {
    createSvelteTable,
    flexRender,
    // @ts-expect-error the types on this are broken, but it exists
    getCoreRowModel,
    renderComponent,
    type TableMeta,
  } from '@tanstack/svelte-table';
  import type {
    Column,
    ColumnDef,
    Row,
    Table,
    TableOptions,
  } from '@tanstack/table-core/build/lib/types';
  import { ContextMenu, MenuFlyoutDivider, MenuFlyoutItem } from 'fluent-svelte';
  import { createEventDispatcher, getContext, tick } from 'svelte';
  import { expoOut } from 'svelte/easing';
  import { derived, writable, type Readable, type Writable } from 'svelte/store';
  import { fly } from 'svelte/transition';
  import Loading from '../Loading.svelte';
  import { trapFocus } from './_trapFocus';
  import type { getFileExplorerData, GetFileExplorerDataParams } from './getFileExplorerData';
  import ValueCell from './ValueCell.svelte';

  export let store: Store | undefined = undefined;
  export let path: Writable<GetFileExplorerDataParams['path']>;
  export let selectedIds: Writable<number[]>;
  export let tableDataFilter: ReturnType<typeof paramsToStrapiFilter>;
  export let tableDataSort: Record<string, 1 | -1>;
  export let enableMultiRowSelection = true;

  type Store = Awaited<ReturnType<typeof getFileExplorerData>>;
  type StoreValue = Parameters<Parameters<Store['subscribe']>[0]>[0];
  type FoldersStoreValue = StoreValue['folders'];
  type FoldersStoreData = FoldersStoreValue['data'];
  type Folder = NonNullable<FoldersStoreData[number]>;
  type FilesStoreValue = StoreValue['files'];
  type FilesStoreData = FilesStoreValue['data'];
  type File = NonNullable<FilesStoreData>['docs'][number];
  type Doc = File;

  const insertFile = getContext('insertFile');

  let editingCell = writable<number>(-1);

  $: tableData = store
    ? derived(store, ($store) => {
        return {
          docs: [...($store.folders.data || []), ...($store.files.data?.docs || [])],
          fetchNextPage: $store.files.fetchNextPage,
          loading: $store.loading,
        };
      })
    : undefined;

  let columns: ColumnDef<Doc>[] = [];
  $: columns = [
    {
      accessorKey: '__checkbox',
      cell: (info) => {
        return renderComponent(ValueCell, {
          info,
          type: 'checkbox',
          key: '__checkbox',
          def: { type: 'boolean' },
        });
      },
      size: 42,
      enableSorting: false,
    },
    {
      header: 'Name',
      accessorKey: 'name',
      cell: (info) => {
        return renderComponent(ValueCell, {
          info,
          type: 'string',
          key: 'name',
          def: { type: 'passthrough' },
          editingCell,
          store,
        });
      },
      size: 360,
      enableSorting: false,
    },

    {
      header: 'Modified at',
      accessorKey: 'updatedAt',
      cell: (info) => {
        return renderComponent(ValueCell, {
          info,
          type: 'string',
          key: 'updatedAt',
          def: { type: 'date' },
        });
      },
      size: 180,
      enableSorting: false,
    },
    {
      header: 'Type',
      accessorKey: 'ext',
      cell: (info) => {
        return renderComponent(ValueCell, {
          info,
          type: 'string',
          key: 'ext',
          def: { type: 'passthrough' },
        });
      },
      enableSorting: false,
    },
    {
      header: 'Size',
      accessorKey: 'size',
      cell: (info) => {
        return renderComponent(ValueCell, {
          info,
          type: 'string',
          key: 'size',
          def: { type: 'size' },
        });
      },
      meta: {
        justify: 'right',
      },
      enableSorting: false,
    },
  ];

  let data: Doc[] = [];
  let filter = JSON.stringify(tableDataFilter);
  let sort = JSON.stringify(tableDataSort);
  $: {
    if (
      data.length !== ($tableData?.docs || []).length ||
      JSON.stringify(data) !== JSON.stringify($tableData?.docs || []) ||
      filter !== JSON.stringify(tableDataFilter) ||
      sort !== JSON.stringify(tableDataSort)
    ) {
      data = $tableData?.docs || [];
      filter = JSON.stringify(tableDataFilter);
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
    enableRowSelection(row) {
      return !isFolderDoc(row.original);
    },
    enableMultiRowSelection: enableMultiRowSelection,
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

  $: table = createSvelteTable(options) as Readable<
    Table<Doc> & { options: { meta?: TableMeta<Doc> } }
  >;

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

  function handleRowSelect(row: Row<Doc>) {
    if (isFolderDoc(row.original)) {
      const originalRow = row.original;
      path.update(($path) => {
        $path.folder = originalRow.id;
        $path.folderPath = originalRow.path;
        $path.folderNumberPath += '/' + originalRow.id;
        $path.breadcrumbs = $path.breadcrumbs + '/' + originalRow.name;
        return $path;
      });
    }
  }

  function isPointerEvent(evt: PointerEvent | MouseEvent): evt is PointerEvent {
    if (hasKey(evt, 'pointerType')) return true;
    return false;
  }

  function isInputElem(target: EventTarget | null): target is HTMLInputElement {
    return !!target && hasKey(target, 'nodeName') && target.nodeName === 'INPUT';
  }

  function isFolderDoc(toCheck: File | Folder): toCheck is Folder {
    return !!toCheck && hasKey(toCheck, 'files');
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
  $: $selectedIds = $table
    .getSelectedRowModel()
    .rows.filter((row) => !isFolderDoc(row.original))
    .map((row) => row.original.id) as number[];

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
                {#if enableMultiRowSelection}
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
                {:else}
                  <span />
                {/if}
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
    {#if !$tableData || $tableData.loading}
      <div class="table-buttons">
        <Loading message="Loading..." />
      </div>
    {:else}
      <div role="rowgroup" class="tbody">
        {#each $table.getRowModel().rows as row, i}
          {@const isFolder = isFolderDoc(row.original)}
          {#key JSON.stringify($path) + row.original.hash + row.original.name + filter}
            <ContextMenu
              on:contextmenu={async () => {
                await tick();
                $trapFocus = false;
              }}
              on:select={async (evt) => {
                console.log(evt);
                $trapFocus = true;
              }}
            >
              <span
                role="row"
                tabindex="0"
                on:click={(evt) => handleRowClick(evt, row)}
                on:keydown={(evt) => handleRowClick(evt, row)}
                on:dblclick={(evt) => {
                  if (!isInputElem(evt.target) && !isCheckbox(evt.target)) {
                    handleRowSelect(row);
                  }
                }}
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
                    {cell.column.id === '__checkbox' ? 'align-self: center;' : ''}
                  "
                    class:compact={$compactMode}
                    class:rightPadding={justify === 'right'}
                  >
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
                      {#if cell.column.id === 'name'}
                        <div class="item-icon">
                          {#if isFolder}
                            <FluentIcon name="Folder16Regular" />
                          {:else if row.original.mime.startsWith('image/')}
                            <img src={row.original.url} alt="" />
                          {:else}
                            <FluentIcon name="Document16Regular" />
                          {/if}
                        </div>
                      {/if}
                      <span
                        class="cell-content"
                        class:noWrap={$table.options.meta?.noWrap}
                        style={cell.column.id === 'name' ? 'width: 100%;' : ''}
                      >
                        <svelte:component
                          this={flexRender(cell.column.columnDef.cell, cell.getContext())}
                        />
                      </span>
                    {/if}
                  </span>
                {/each}
              </span>
              <svelte:fragment slot="flyout">
                {#if isFolder}
                  <MenuFlyoutItem
                    on:click={async () => {
                      $trapFocus = true;
                      handleRowSelect(row);
                    }}
                  >
                    Open
                  </MenuFlyoutItem>
                {:else}
                  <MenuFlyoutItem
                    on:click={async () => {
                      $trapFocus = true;
                      insertFile?.(row.original);
                    }}
                  >
                    Insert
                  </MenuFlyoutItem>
                {/if}
                <MenuFlyoutItem
                  on:click={async () => {
                    $editingCell = row.index;
                  }}
                >
                  Rename
                </MenuFlyoutItem>
              </svelte:fragment>
            </ContextMenu>
          {/key}
        {/each}
      </div>
    {/if}
  </div>
  <!-- 
  {#if ($tableData.data?.totalDocs || 0) > ($tableData.data?.docs || []).length}
    <div class="table-buttons">
      {#if loadingMore}
        <Loading message="Loading more..." />
      {:else}
        <Button
          on:click={() => {
            // if ($tableData?.data?.docs) {
            //   loadingMore = true;
            //   $tableData
            //     .fetchNextPage($tableData.data?.page)
            //     .then(({ current, next, setStore }) => {
            //       if (current && next) {
            //         const allDocs = [...(current.docs || []), ...(next.docs || [])];
            //         setStore({
            //           ...current,
            //           docs: allDocs,
            //           totalDocs: current.totalDocs,
            //         });
            //         loadingMore = false;
            //       }
            //     });
            // }
          }}
        >
          Load more
        </Button>
      {/if}
    </div>
  {/if} -->
</div>

<style>
  div.wrapper {
    --border-color: var(--color-neutral-light-200)
    border: 1px solid var(--fds-divider-stroke-default);
    box-shadow: 0 0 0 1px var(--border-color);
    border-radius: var(--fds-control-corner-radius) var(--fds-control-corner-radius) 0 0;
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
    user-select: none;
  }
  span[role='row'] {
    text-decoration: none;
    color: inherit;
    cursor: default;
  }
  span[role='row']:hover {
    background-color: var(--fds-subtle-fill-secondary);
  }
  span[role='row']:active {
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

  span[role='cell'].rightPadding {
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
    justify-content: flex-start;
    padding: 20px 10px
  }

  /* row icons */
  .item-icon {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    margin-right: 3px;
  }
  .item-icon :global(svg) {
    fill: currentColor;
    width: 20px;
    height: 20px;
  }
  .item-icon img {
    width: 20px;
  }
</style>
