<script lang="ts">
  import { Button, ContentDialog, Expander } from 'fluent-svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  export let open = false;
</script>

<ContentDialog bind:open title="Developer" size="max" class="developer-dialog">
  <Expander>
    Document data
    <pre slot="content">{JSON.stringify(data.docData, null, 2)}</pre>
  </Expander>
  <Button slot="footer" on:click={() => (open = false)}>Close</Button>
</ContentDialog>

<style>
  :global(.developer-dialog) {
    inline-size: unset !important;
    height: 100%;
  }
  pre {
    user-select: text;
  }
</style>
