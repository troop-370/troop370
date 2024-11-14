<script lang="ts">
  import { Expander } from 'fluent-svelte';
  import type { PageData } from './$types';
  import PermissionsDetails from './PermissionsDetails.svelte';

  export let data: PageData;
  $: ({ permissions, contentTypeSchema, collectionConfig, session, ...rest } = data);

  $: ({ attributes, layouts, metadatas, ...settings } = $collectionConfig as NonNullable<
    typeof $collectionConfig
  >);
</script>

<div class="wrapper">
  <Expander>
    Permissions
    <svelte:fragment slot="content">
      {#each permissions as permission}
        <PermissionsDetails {permission} />
      {/each}
    </svelte:fragment>
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
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  pre {
    user-select: text;
  }
</style>
