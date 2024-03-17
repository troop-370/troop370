<script lang="ts">
  import { writable, type Writable } from 'svelte/store';
  import ActionsRow from './_ActionsRow.svelte';
  import Breadcrumbs from './_Breadcrumbs.svelte';
  import FileTable from './_FileTable.svelte';
  import ExplorerFooter from './_Footer.svelte';
  import type { getFileExplorerData, GetFileExplorerDataParams } from './getFileExplorerData';

  export let store: Awaited<ReturnType<typeof getFileExplorerData>> | undefined = undefined;
  export let path: Writable<GetFileExplorerDataParams['path']>;
  export let search: Writable<string>;
  export let selectedIds: Writable<number[]>;
  export let mimeTypes: string[] = [];
  export let enableMultiRowSelection = true;

  let editingCell = writable<number>(-1);
</script>

<Breadcrumbs {path} {search} {store} />

<ActionsRow {path} {store} {editingCell} />

<div class="explorer">
  <div class="file-table-wrapper">
    <FileTable
      {store}
      {path}
      tableDataSort={{}}
      tableDataFilter={{}}
      {selectedIds}
      {enableMultiRowSelection}
      {editingCell}
    />
  </div>
</div>

<ExplorerFooter
  itemCount={($store?.files?.data?.docs?.length || 0) + ($store?.folders?.data?.length || 0)}
  selectedItemsCount={$selectedIds.length}
  selectedItemsSize={$store?.files.data?.docs
    .filter((doc) => $selectedIds.includes(doc.id))
    .map((doc) => doc.size)
    .reduce((acc, size) => acc + size * 1000, 0)}
  {mimeTypes}
/>
