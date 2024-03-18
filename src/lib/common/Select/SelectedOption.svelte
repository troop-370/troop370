<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { IconButton } from 'fluent-svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    startdrag: (MouseEvent | TouchEvent) & {
      currentTarget: EventTarget & HTMLDivElement;
    };
    dismiss: undefined;
    open: undefined;
  }>();

  export let label: string | undefined;
  export let _id: string;

  export let disabled = false;

  export let openable = false;

  export let draggable = false;
  export let dragging = false;

  export let hideId = false;
</script>

<div class="selected-item" on:keydown on:focus on:blur on:mousedown on:touchstart>
  <div
    style="display: flex;"
    on:mousedown={(evt) => dispatch('startdrag', evt)}
    on:touchstart={(evt) => dispatch('startdrag', evt)}
  >
    {#if draggable}
      <IconButton
        tabindex={-1}
        aria-label="drag-handle"
        style="padding: 0; {disabled ? 'cursor: default;' : dragging ? 'cursor: grab;' : 'cursor: grabbing;'}"
        {disabled}
      >
        <svg
          width="30"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          style="height: 100%;width: 100%;"
          viewBox="0 0 42 24"
        >
          <path
            style=""
            d="M15.75 15.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0-7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm7 7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0-7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm7 7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0-7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
          />
        </svg>
      </IconButton>
    {/if}
  </div>
  <div class="select-item-detail">
    <div class="selected-item-label">{label || _id}</div>
    {#if !hideId}
      <div class="selected-item-id">{_id}</div>
    {/if}
  </div>
  {#if openable}
    <IconButton on:click={() => dispatch('open')}>
      <FluentIcon name="Open24Regular" />
    </IconButton>
  {/if}
  <IconButton {disabled} on:click={() => dispatch('dismiss')}>
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
