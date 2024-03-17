<script lang="ts">
  import { openWindow } from '$utils';
  import { Button, InfoBar } from 'fluent-svelte';
  import { writable, type Writable } from 'svelte/store';
  import ActionsRow from './_ActionsRow.svelte';
  import Breadcrumbs from './_Breadcrumbs.svelte';
  import FileTable from './_FileTable.svelte';
  import ExplorerFooter from './_Footer.svelte';
  import type { GetFileExplorerDataParams, getFileExplorerData } from './getFileExplorerData';

  export let store: Awaited<ReturnType<typeof getFileExplorerData>> | undefined = undefined;
  export let path: Writable<GetFileExplorerDataParams['path']>;
  export let search: Writable<string>;
  export let selectedIds: Writable<number[]>;
  export let mimeTypes: string[] = [];
  export let enableMultiRowSelection = true;

  let editingCell = writable<number>(-1);
</script>

<Breadcrumbs {path} {search} {store} />

<ActionsRow {path} {store} {editingCell} selectedItemsCount={$selectedIds.length} />

<InfoBar title="Looking to edit or upload assets?" style="margin-bottom: 10px;">
  Use the media library app.
  <Button
    variant="standard"
    href="/admin/plugins/upload?childWindow=1"
    slot="action"
    on:click={(evt) => {
      evt.preventDefault();
      openWindow('/admin/plugins/upload?childWindow=1', 'uploadApp', 'location=no');
    }}
  >
    Open media library app
  </Button>
</InfoBar>

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
