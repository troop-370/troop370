<script lang="ts">
  import { Button } from 'fluent-svelte';

  export let href = '';
  export let disabled = false;
</script>

<Button class="tile-button" {href} on:click {disabled}>
  <slot name="icon" />
  <span><slot /></span>
</Button>

<style>
  :global(.tile-button) {
    width: 110px;
    height: 80px;
    overflow: hidden;

    display: flex;
    flex-direction: column;
  }

  :global(.tile-button svg) {
    width: 24px;
    height: 24px;
    fill: currentColor;
    padding: 10px;
  }

  span {
    margin-top: -2px;
    text-align: center;
    white-space: nowrap;
    max-width: 92px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
