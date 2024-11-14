<script lang="ts">
  import Chip from '$lib/common/Chip/Chip.svelte';
  import { TextBlock } from 'fluent-svelte';
  import type { PageData } from './$types';

  export let permission: PageData['permissions'][number];

  const { fields, ...properties } = permission.properties;
</script>

<article>
  <TextBlock variant="bodyStrong">{permission.action}</TextBlock>

  {#if fields}
    <section>
      <div>
        <TextBlock variant="body">Fields</TextBlock>
      </div>
      <div>
        {#each fields as key}
          <Chip color="neutral">{key}</Chip>
        {/each}
      </div>
    </section>
  {/if}

  {#if properties && Object.keys(properties).length > 0}
    <section>
      <div>
        <TextBlock variant="body">Additional properties</TextBlock>
      </div>
      <pre>{JSON.stringify(properties, null, 2)}</pre>
    </section>
  {/if}

  {#if permission.actionParameters && Object.keys(permission.actionParameters).length > 0}
    <section>
      <div>
        <TextBlock variant="body">Action parameters</TextBlock>
      </div>
      <pre>{JSON.stringify(permission.actionParameters, null, 2)}</pre>
    </section>
  {/if}

  {#if permission.conditions && Object.keys(permission.conditions).length > 0}
    <section>
      <div>
        <TextBlock variant="body">Conditions</TextBlock>
      </div>
      <pre>{JSON.stringify(permission.conditions, null, 2)}</pre>
    </section>
  {/if}
</article>

<style>
  section {
    margin-left: 1rem;
    margin-bottom: 0.5rem;
  }
  section > div:first-child {
    font-style: italic;
  }
  pre {
    margin: 0;
    width: 100%;
    border-color: var(--color-neutral-light-200);
    background-color: var(--color-neutral-light-100);
  }
  @media (prefers-color-scheme: dark) {
    pre {
      border: 1px solid var(--color-neutral-dark-200);
      background-color: var(--color-neutral-dark-100);
    }
  }
</style>
