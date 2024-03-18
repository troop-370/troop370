<script lang="ts">
  import { page } from '$app/stores';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { formatBytes, formatISODate, hasKey } from '$utils';
  import { Button, ContentDialog, ProgressRing, TextBlock } from 'fluent-svelte';
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { getFileExplorerData } from './getFileExplorerData';

  type Store = Awaited<ReturnType<typeof getFileExplorerData>>;
  type StoreValue = Parameters<Parameters<Store['subscribe']>[0]>[0];
  type FoldersStoreValue = StoreValue['folders'];
  type FoldersStoreData = FoldersStoreValue['data'];
  type Folder = NonNullable<FoldersStoreData[number]>;
  type FilesStoreValue = StoreValue['files'];
  type FilesStoreData = FilesStoreValue['data'];
  type File = NonNullable<FilesStoreData>['docs'][number];

  export let open = false;
  export let handleAction: ((deletedIds?: number[]) => Promise<void>) | undefined = undefined;

  let loadingSubmit = false;
  let loadingCancel = false;

  let { selectedFoldersData, selectedFilesData, selectedIdsData } = getContext<{
    selectedFoldersData: Writable<Folder[]>;
    selectedFilesData: Writable<File[]>;
    selectedIdsData: Writable<(Folder | File)[]>;
  }>('fileExplorer');

  $: areOnlyFiles = $selectedFilesData.length > 0 && $selectedFoldersData.length === 0;
  $: areOnlyFolders = $selectedFilesData.length === 0 && $selectedFoldersData.length > 0;

  $: type =
    (areOnlyFiles ? 'file' : areOnlyFolders ? 'folder' : 'item') +
    ($selectedIdsData.length > 1 ? 's' : '');

  async function handleDelete() {
    const folderIds = $selectedFoldersData.map((folder) => Math.abs(folder.id));
    const fileIds = $selectedFilesData.map((file) => file.id);

    await fetch('/admin/strapi/upload/actions/bulk-delete', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${$page.data.session?.adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        folderIds: folderIds,
        fileIds: fileIds,
      }),
    });

    return [...folderIds.map((id) => -1 * id), ...fileIds];
  }
</script>

<ContentDialog
  title="Delete {$selectedIdsData.length > 1 ? 'multiple' : ''} {type}"
  bind:open
  size="standard"
>
  {#if $selectedIdsData.length > 3}
    <TextBlock>
      Are you sure you want to permanently delete these {$selectedIdsData.length}
      {type}?
    </TextBlock>
  {:else}
    <TextBlock>Are you sure you want to permanently delete the selected {type}?</TextBlock>
  {/if}

  {#each $selectedIdsData as item}
    {@const isFolder = item.id < 0}
    <div class="item">
      <div class="thumbnail-wrapper">
        {#if isFolder}
          <FluentIcon name="Folder16Regular" />
        {:else if hasKey(item, 'mime') && item.mime.startsWith('image/')}
          <img src={item.url} alt="" />
        {:else}
          <FluentIcon name="Document16Regular" />
        {/if}
      </div>
      <div class="meta">
        {#if item.name}
          <div class="name">{item.name}</div>
        {/if}
        {#if hasKey(item, 'mime') && item.mime}
          <div class="type">Type: {item.mime}</div>
        {/if}
        {#if hasKey(item, 'size') && item.size}
          <div class="size">Size: {formatBytes(item.size * 1000, 0)}</div>
        {/if}
        {#if item.updatedAt}
          <div class="modified">
            Modified at: {formatISODate(item.updatedAt, false, true, true)}
          </div>
        {:else if item.createdAt}
          <div class="modified">Created at: {formatISODate(item.createdAt, false, true, true)}</div>
        {/if}
      </div>
    </div>
  {/each}

  <svelte:fragment slot="footer">
    <Button
      variant="accent"
      on:click={async () => {
        loadingSubmit = true;
        const deletedIds = await handleDelete();
        await handleAction?.(deletedIds);
        open = false;
        loadingSubmit = false;
      }}
    >
      {#if loadingSubmit}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        Yes, delete
      {/if}
    </Button>
    <Button
      on:click={async () => {
        loadingCancel = true;
        await handleAction?.();
        open = false;
        loadingCancel = false;
      }}
    >
      {#if loadingCancel}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        No, cancel
      {/if}
    </Button>
  </svelte:fragment>
</ContentDialog>

<style>
  .item {
    display: flex;
    gap: 20px;
    margin-top: 20px;
  }

  .thumbnail-wrapper {
    border: 1px solid #80808080;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 0;
    flex-shrink: 0;
  }
  .thumbnail-wrapper :global(svg) {
    fill: currentColor;
    width: 30px;
    height: 30px;
  }
  .thumbnail-wrapper img {
    width: 100%;
  }

  .meta > div {
    line-height: 16px;
    margin: 2px 0 4px 0;
  }
</style>
