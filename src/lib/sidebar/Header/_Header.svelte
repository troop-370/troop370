<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { IconButton, TextBlock } from 'fluent-svelte';

  export let tag = 'h1';
</script>

<div class="sidebar-header">
  <div class="sidebar-header--content">
    <TextBlock variant="bodyStrong" {tag} style="font-size: 16px;">
      <slot />
    </TextBlock>
  </div>
  <IconButton on:click>
    <FluentIcon name="Dismiss20Regular" />
  </IconButton>
</div>

<style>
  .sidebar-header {
    color: var(--fds-text-primary);
    padding: 16px;
    height: 54px;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
</style>
