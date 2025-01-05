<script lang="ts">
  import { IconButton } from 'fluent-svelte';
  import { createEventDispatcher } from 'svelte';
  import FluentIcon from '../FluentIcon.svelte';

  const dispatch = createEventDispatcher<{
    dismiss: undefined;
    open: undefined;
  }>();

  export let label: string;
  export let credit = '';
  export let disabled = false;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="selected-item" on:keydown on:focus on:blur on:mousedown on:touchstart>
  <div style="display: flex;"></div>
  <div class="select-item-detail">
    <div class="selected-item-label">
      {label}
    </div>
    <div class="selected-item-id">
      {#if credit}
        {credit}
      {:else}
        <span class="status"> ⚠ </span>
        <span>This file is missing attribution</span>
      {/if}
    </div>
  </div>
  <IconButton on:click={() => dispatch('open')}>
    <FluentIcon name="Open24Regular" />
  </IconButton>
  <IconButton
    {disabled}
    on:click={() => {
      if (!disabled) {
        dispatch('dismiss');
      }
    }}
  >
    <FluentIcon name="Dismiss24Regular" />
  </IconButton>
</div>

<style>
  .selected-item {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    margin-top: 6px;
    background-color: var(--fds-card-background-default);
    box-shadow: inset 0 0 0 1px var(--fds-control-stroke-default);
    border-radius: var(--fds-control-corner-radius);
  }

  .selected-item:focus-visible {
    outline: none;
    box-shadow: var(--fds-focus-stroke);
  }

  .select-item-detail {
    display: flex;
    flex-direction: column;
    padding: 10px;
    flex-grow: 1;
  }

  .selected-item-label {
    font-family: var(--fds-font-family-text);
    font-size: 14px;
    font-variant-numeric: lining-nums;
    line-height: 16px;
    flex-wrap: nowrap;
    word-break: break-word;
    color: var(--fds-text-primary);
    position: relative;
  }

  .selected-item-id {
    font-family: var(--fds-font-family-text);
    font-size: 11px;
    font-variant-numeric: lining-nums;
    line-height: 16px;
    flex-wrap: nowrap;
    color: var(--fds-text-secondary);
    opacity: 0.8;
  }
</style>
