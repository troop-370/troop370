<script lang="ts">
  import { Button, ContentDialog, Expander } from 'fluent-svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  export let open = false;

  $: ({ permissions, contentTypeSchema, collectionConfig, session, ...rest } = data);
  $: ({ attributes, layouts, metadatas, ...settings } = $collectionConfig as NonNullable<
    typeof $collectionConfig
  >);
</script>

<ContentDialog bind:open title="Developer" size="max" class="developer-dialog">
  <Expander>
    Document data
    <pre slot="content">{JSON.stringify(data.docData, null, 2)}</pre>
  </Expander>

  {#if $contentTypeSchema && Object.keys(contentTypeSchema).length > 0}
    <Expander>
      Schema
      <svelte:fragment slot="content">
        <pre>{JSON.stringify($contentTypeSchema, null, 2)}</pre>
      </svelte:fragment>
    </Expander>
  {/if}

  {#if settings && Object.keys(settings).length > 0}
    <Expander>
      Collection settings
      <svelte:fragment slot="content">
        <pre>{JSON.stringify(settings, null, 2)}</pre>
      </svelte:fragment>
    </Expander>
  {/if}

  {#if session && Object.keys(session).length > 0}
    <Expander>
      Session
      <svelte:fragment slot="content">
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </svelte:fragment>
    </Expander>
  {/if}

  {#if rest && Object.keys(rest).length > 0}
    <Expander>
      Rest
      <svelte:fragment slot="content">
        <pre>{JSON.stringify(rest, null, 2)}</pre>
      </svelte:fragment>
    </Expander>
  {/if}

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
