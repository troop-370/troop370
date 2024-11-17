<script lang="ts">
  import { Button, ContentDialog } from 'fluent-svelte';
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import FileExplorerDataWrapper from './_FileExplorerDataWrapper.svelte';
  import { trapFocus } from './_trapFocus';
  import type { getFileExplorerData } from './getFileExplorerData';

  export let open = false;
  export let session: Partial<SessionData>;
  export let url: URL;
  export let mimeTypes: string[] = [];

  $: {
    open;
    $trapFocus = true;
  }

  type Store = Awaited<ReturnType<typeof getFileExplorerData>>;
  type StoreValue = Parameters<Parameters<Store['subscribe']>[0]>[0];
  type FoldersStoreValue = StoreValue['folders'];
  type FoldersStoreData = FoldersStoreValue['data'];
  type Folder = NonNullable<FoldersStoreData[number]>;
  type FilesStoreValue = StoreValue['files'];
  type FilesStoreData = FilesStoreValue['data'];
  type File = NonNullable<FilesStoreData>['docs'][number];

  let selectedIds = writable<number[]>([]);
  let selectedFilesData = writable<File[]>([]);

  setContext('insertFile', (file: File) => {
    handleAction?.([file]);
    open = false;
  });

  export let handleAction: ((selectedFiles?: File[]) => Promise<void>) | undefined = undefined;
</script>

<ContentDialog bind:open size="max" class="file-explorer-dialog" trapFocus={$trapFocus}>
  <div class="wrapper">
    <FileExplorerDataWrapper
      {session}
      {url}
      {mimeTypes}
      bind:selectedIds
      bind:selectedFilesData
      enableMultiRowSelection={false}
    />
  </div>

  <svelte:fragment slot="footer">
    <Button
      variant="accent"
      disabled={$selectedIds.length === 0 || $selectedIds.length !== $selectedFilesData.length}
      on:click={async () => {
        await handleAction?.($selectedFilesData);
        open = false;
      }}
    >
      Insert
    </Button>
    <Button
      on:click={async () => {
        await handleAction?.();
        open = false;
      }}
    >
      Cancel
    </Button>
  </svelte:fragment>
</ContentDialog>

<style>
  :global(.file-explorer-dialog.size-max) {
    inline-size: unset !important;
    height: 100%;
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  :global(.file-explorer-dialog .explorer) {
    display: flex;
    flex-direction: row;
    height: 100%;
    overflow: hidden;
    box-sizing: border-box;

    margin: 1px;
    --border-color: var(--color-neutral-light-200);
    box-shadow: 0 0 0 1px var(--border-color);
    border-radius: var(--fds-control-corner-radius) var(--fds-control-corner-radius) 0 0;
  }

  @media (prefers-color-scheme: dark) {
    :global(.file-explorer-dialog .explorer) {
      --border-color: var(--color-neutral-dark-200);
    }
  }

  :global(.file-explorer-dialog .file-table-wrapper) {
    height: 100%;
  }
</style>
