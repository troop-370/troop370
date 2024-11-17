<script lang="ts">
  import { page } from '$app/stores';
  import { FileExplorerDialog } from '$components/poptart/FileExplorer';
  import { copy } from 'copy-anything';
  import { flatten } from 'flatten-anything';
  import { Button } from 'fluent-svelte';
  import DeveloperDialog from './DeveloperDialog.svelte';
  import Fields from './Fields.svelte';

  export let data;
  $: ({ collectionConfig } = data);
  $: docData = flatten(copy(data.docData)) as Record<string, unknown>;
  let sessionAdminToken = data.session.adminToken;

  let developerDialogOpen = false;
  let explorerDialogOpen = false;
</script>

<DeveloperDialog bind:open={developerDialogOpen} {data} />
<FileExplorerDialog url={$page.url} session={data.session} bind:open={explorerDialogOpen} />

<Button on:click={() => (developerDialogOpen = true)}>Open Developer Dialog</Button>
<Button on:click={() => (explorerDialogOpen = true)}>Open Explorer Dialog</Button>

<article>
  <Fields defs={$collectionConfig.defs} {docData} {sessionAdminToken} variant="show-hidden" />
</article>

<style>
  article {
    max-width: 800px;
    margin: 0 auto;
  }
</style>
