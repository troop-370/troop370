<script lang="ts">
  import type { Writable } from 'svelte/store';
  import ActionsRow from './_ActionsRow.svelte';
  import Breadcrumbs from './_Breadcrumbs.svelte';
  import FileTable from './_FileTable.svelte';
  import type { GetFileExplorerDataParams, getFileExplorerData } from './getFileExplorerData';

  export let store: Awaited<ReturnType<typeof getFileExplorerData>> | undefined = undefined;
  export let path: Writable<GetFileExplorerDataParams['path']>;
  export let search: Writable<string>;
  export let selectedIds: Writable<number[]>;
  export let enableMultiRowSelection = true;
</script>

<Breadcrumbs {path} {search} {store} />

<ActionsRow />

<div class="explorer">
  <div class="file-table-wrapper">
    <FileTable
      {store}
      {path}
      tableDataSort={{}}
      tableDataFilter={{}}
      {selectedIds}
      {enableMultiRowSelection}
    />
  </div>
</div>
