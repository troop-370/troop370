<script lang="ts">
  import { page } from '$app/stores';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { Button } from 'fluent-svelte';
  import type { Writable } from 'svelte/store';
  import type { GetFileExplorerDataParams, getFileExplorerData } from './getFileExplorerData';

  export let store: Awaited<ReturnType<typeof getFileExplorerData>> | undefined = undefined;
  export let path: Writable<GetFileExplorerDataParams['path']>;
  export let editingCell: Writable<number>;

  function createFolder() {
    const duplicates =
      $store?.folders.data
        .map((folder) => folder.name)
        .map((name) => name.replace(/(\(\d+\))$/, '').trim())
        .filter((name) => name === 'New folder') || [];

    fetch(`/admin/strapi/upload/folders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${$page.data.session?.adminToken}`,
      },
      body: JSON.stringify({
        name: duplicates.length > 0 ? `New folder (${duplicates.length})` : 'New folder',
        parent: $path.folder || null,
      }),
    })
      .then((res) => res.json())
      .then(({ data }) => {
        $store?.folders.refetch().then(() => {
          const folderIndex = $store?.folders.data.findIndex((folder) => folder.id === data.id);
          $editingCell = folderIndex ?? -1;
        });
      });
  }
</script>

<div class="file-explorer-toolbar">
  <Button disabled={$store?.loading} on:click={createFolder}>
    <FluentIcon name="FolderAdd16Regular" mode="buttonIconLeft" />
    New folder
  </Button>
  <Button disabled>
    <FluentIcon name="ArrowUpload16Regular" mode="buttonIconLeft" />
    Upload asset
  </Button>
</div>

<style>
  .file-explorer-toolbar {
    display: flex;
    justify-content: flex-start;
    padding: 0 0 10px 0;
    gap: 10px;
  }
</style>
