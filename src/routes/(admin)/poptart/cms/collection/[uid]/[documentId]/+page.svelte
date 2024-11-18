<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { FileExplorerDialog } from '$components/poptart/FileExplorer';
  import { Button } from 'fluent-svelte';
  import { onDestroy, onMount } from 'svelte';
  import DeveloperDialog from './DeveloperDialog.svelte';
  import Fields from './Fields.svelte';

  export let data;
  $: ({ collectionConfig, docDataStore } = data);
  let sessionAdminToken = data.session.adminToken;

  let developerDialogOpen = false;
  let explorerDialogOpen = false;
  let showHiddenFields = false;

  function keyboardShortcuts(evt: KeyboardEvent) {
    // trigger whether hidden fields are shown
    // ALT + SHIFT + H
    if (evt.altKey && evt.shiftKey && evt.key === 'H') {
      evt.preventDefault();
      showHiddenFields = !showHiddenFields;
      return;
    }
  }
  onMount(() => {
    document.addEventListener('keydown', keyboardShortcuts);
  });
  onDestroy(() => {
    if (browser) document.removeEventListener('keydown', keyboardShortcuts);
  });
</script>

<DeveloperDialog bind:open={developerDialogOpen} {data} />
<FileExplorerDialog url={$page.url} session={data.session} bind:open={explorerDialogOpen} />

<Button on:click={() => (developerDialogOpen = true)}>Open Developer Dialog</Button>
<Button on:click={() => (explorerDialogOpen = true)}>Open Explorer Dialog</Button>

<article>
  <Fields
    defs={$collectionConfig.defs}
    docData={docDataStore}
    {sessionAdminToken}
    variant={showHiddenFields ? 'show-hidden' : 'normal'}
  />
</article>

<style>
  article {
    max-width: 800px;
    margin: 0 auto;
  }
</style>
