<script lang="ts">
  import { TextBlock } from 'fluent-svelte';

  export let fullWidth = false;
  export let style = '';
</script>

<h1 class:fullWidth {style}>
  <TextBlock variant="title" tag="span"><slot /></TextBlock>
</h1>

<style>
  h1 {
    margin: 32px auto 20px auto;
    padding: 0 20px;
    max-width: 1000px;
  }

  h1.fullWidth {
    max-width: none;
  }
</style>
