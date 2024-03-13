<script lang="ts">
  import { SidebarHeader } from '$lib/sidebar';
  import { TextBlock } from 'fluent-svelte';
  import { richTextParams } from '../richTextParams';

  let headerHeight = 100;
</script>

<div class="header" bind:clientHeight={headerHeight}>
  <SidebarHeader on:click={() => $richTextParams.set('props', 0)}>Document properties</SidebarHeader
  >
</div>

<div class="props-wrapper" style="height: calc(100% - {headerHeight}px);">
  {#if $richTextParams.isActive('fs')}
    <TextBlock>Document properties in this pane are not yet supported.</TextBlock>
  {:else}
    <TextBlock>To view document properties in this pane, enter fullscreen mode.</TextBlock>
  {/if}
</div>

<style>
  .props-wrapper {
    padding: 0 12px 0 12px;
    overflow: auto;
    scroll-behavior: smooth;
  }

  .sidebar-wrapper {
    background-color: var(--fds-control-fill-default);
    padding: 0 12px 18px 12px;
    margin-bottom: 18px;
    border-radius: var(--fds-control-corner-radius);
  }
</style>
