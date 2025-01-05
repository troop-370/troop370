<script lang="ts">
  import { page } from '$app/stores';
  import { PUBLIC_NEW_FILESTORE_PATH, PUBLIC_OLD_FILESTORE_PATH } from '$env/static/public';
  import { openWindow } from '$utils';
  import { Button } from 'fluent-svelte';
  import { readable, type Writable } from 'svelte/store';
  import { FileExplorerDialog } from '../FileExplorer';
  import SelectedFile from './SelectedFile.svelte';

  type StoreType = Writable<{
    documentId: string;
    name: string;
    url: string;
    caption?: string;
  }>;

  export let docData: Writable<Record<string, unknown>>;
  export let key: string;
  export let disabled = false;

  let store: StoreType | null;
  $: store = ($docData[key] as StoreType) || readable(null);

  export let open = false;
</script>

{#if $store}
  <SelectedFile
    label={$store.name}
    credit={$store.caption}
    {disabled}
    on:open={() => {
      openWindow(
        $store?.url?.replace(
          PUBLIC_OLD_FILESTORE_PATH,
          PUBLIC_NEW_FILESTORE_PATH.replace('https://troop370atlanta.org', $page.url.origin)
        ) || $page.url.origin,
        $store?.url || $page.url.origin,
        'location=no'
      );
    }}
    on:dismiss={() => {
      $docData[key] = null;
    }}
  />
{:else}
  <Button on:click={() => (open = true)}>Pick a file</Button>
{/if}

<FileExplorerDialog
  url={$page.url}
  session={$page.data.session}
  bind:open
  mimeTypes={[
    'image/apng',
    'image/avif',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'image/webp',
  ]}
  handleAction={async (selectedFiles) => {
    if (selectedFiles?.[0]?.id) {
      $docData[key] = selectedFiles[0];
    } else {
    }
    open = false;
  }}
/>
