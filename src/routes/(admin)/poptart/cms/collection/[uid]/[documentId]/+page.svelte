<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { FileExplorerDialog } from '$components/poptart/FileExplorer';
  import { title } from '$stores/title';
  import { Button } from 'fluent-svelte';
  import DeveloperDialog from './DeveloperDialog.svelte';
  import Editor from './Editor.svelte';

  export let data;
  $: ({ collectionConfig, docDataStore, saveStatus } = data);

  let developerDialogOpen = false;
  let explorerDialogOpen = false;

  $: if (browser) {
    title.set(`${$docDataStore[$collectionConfig.settings.mainField]} - ${$saveStatus}`);
  }
</script>

<DeveloperDialog bind:open={developerDialogOpen} {data} />
<FileExplorerDialog url={$page.url} session={data.session} bind:open={explorerDialogOpen} />

<Button on:click={() => (developerDialogOpen = true)}>Open Developer Dialog</Button>
<Button on:click={() => (explorerDialogOpen = true)}>Open Explorer Dialog</Button>
<Button on:click={data.save} disabled={$saveStatus === 'Saved'}>Save</Button>

<article>
  <Editor
    data={{
      collectionConfig,
      docDataStore,
      session: data.session,
      save: data.save,
      defs: data.defs,
    }}
  />
</article>

<style>
  article {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
</style>
