<script lang="ts">
  import { page } from '$app/stores';
  import { FileExplorerDialog } from '$components/poptart/FileExplorer';
  import { Button } from 'fluent-svelte';
  import DeveloperDialog from './DeveloperDialog.svelte';
  import Fields from './Fields.svelte';

  export let data;
  $: ({ collectionConfig, docDataStore } = data);
  let sessionAdminToken = data.session.adminToken;

  let developerDialogOpen = false;
  let explorerDialogOpen = false;
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
    variant="show-hidden"
  />
</article>

<style>
  article {
    max-width: 800px;
    margin: 0 auto;
  }
</style>
