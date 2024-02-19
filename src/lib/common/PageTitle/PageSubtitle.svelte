<script lang="ts">
  import { TextBlock } from 'fluent-svelte';

  export let style: string = '';
  export let caption: string = '';
</script>

<TextBlock variant="subtitle" tag="h2" class="page-subtitle-h2" {style}><slot /></TextBlock>

{#if caption}
  <p>
    <TextBlock tag="span">{caption}</TextBlock>
  </p>
{/if}

<style>
  :global(.text-block.type-subtitle.page-subtitle-h2),
  p {
    padding: 0 20px;
    max-width: 1000px;
    display: block;
  }
  :global(.text-block.type-subtitle.page-subtitle-h2) {
    margin: 25px auto 10px auto;
  }
  p {
    margin: -8px auto 10px auto;
  }
</style>
