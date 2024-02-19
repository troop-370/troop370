<script lang="ts">
  import { ProgressRing, TextBlock } from 'fluent-svelte';

  export let message = 'Loading...';
  export let style = '';
  export let size = 24;
</script>

<div style="--size: {size}px; {style}">
  <ProgressRing {size} />
  <TextBlock variant="bodyStrong">
    {message}
  </TextBlock>
</div>

<style>
  div {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }

  div :global(.progress-ring) {
    min-block-size: var(--size) !important;
    min-inline-size: var(--size) !important;
  }
</style>
