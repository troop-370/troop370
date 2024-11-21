<script lang="ts">
  import { browser } from '$app/environment';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { ActionRow, PageTitle } from '$lib/common/PageTitle';
  import { title } from '$stores/title';
  import { Button, ProgressRing } from 'fluent-svelte';
  import Editor from '../[documentId]/Editor.svelte';

  export let data;
  $: ({ collectionConfig, docDataStore, saving } = data);

  $: if (browser) {
    title.set(
      `${$docDataStore[$collectionConfig.settings.mainField] || 'New document'} - ${$saving ? 'Saving' : 'Unsaved'}`
    );
  }
</script>

<div class="header">
  <PageTitle>Create an entry</PageTitle>

  <ActionRow>
    <Button
      variant="accent"
      disabled={$saving}
      on:click={data.save}
      style="width: 156px; height: 32px;"
    >
      {#if $saving}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        <FluentIcon name="Save16Regular" mode="buttonIconLeft" />
        Create new draft
      {/if}
    </Button>
  </ActionRow>
</div>

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

  <br />
  <br />
  <Button
    variant="accent"
    disabled={$saving}
    on:click={data.save}
    style="width: 156px; height: 32px;"
  >
    {#if $saving}
      <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
    {:else}
      <FluentIcon name="Save16Regular" mode="buttonIconLeft" />
      Create new draft
    {/if}
  </Button>
</article>

<style>
  article {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  .header {
    max-width: 840px;
    margin: 0 auto;
  }
</style>
