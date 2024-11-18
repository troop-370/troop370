<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { IconButton } from 'fluent-svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    startdrag: (MouseEvent | TouchEvent) & {
      currentTarget: EventTarget & HTMLDivElement;
    };
    stopdrag: (MouseEvent | TouchEvent) & {
      currentTarget: EventTarget & HTMLDivElement;
    };
    dismiss: undefined;
    open: undefined;
    collapse: boolean;
  }>();

  export let disabled = false;
  export let collapsed = false;

  export let draggable = false;
  export let dragging = false;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="doc-array-item" on:keydown on:focus on:blur on:mousedown on:touchstart>
  <div
    style="display: flex;"
    on:mousedown={(evt) => dispatch('startdrag', evt)}
    on:mouseup={(evt) => dispatch('stopdrag', evt)}
    on:touchstart={(evt) => dispatch('startdrag', evt)}
    on:touchend={(evt) => dispatch('stopdrag', evt)}
  >
    {#if draggable}
      <IconButton
        tabindex={-1}
        aria-label="drag-handle"
        style="padding: 0; {disabled || dragging
          ? 'cursor: grabbing;'
          : 'cursor: grab;'}; width: 30px;"
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
  <div class="doc-array-item-detail">
    <slot />
  </div>
  <div class="buttons">
    <IconButton {disabled} on:click={() => dispatch('dismiss')}>
      <FluentIcon name="Dismiss24Regular" />
    </IconButton>
    <!-- {#if collapsed}
      <IconButton {disabled} on:click={() => dispatch('collapse', false)}>
        <FluentIcon name="ChevronDown24Regular" />
      </IconButton>
    {:else}
      <IconButton {disabled} on:click={() => dispatch('collapse', true)}>
        <FluentIcon name="ChevronUp24Regular" />
      </IconButton>
    {/if} -->
  </div>
</div>

<style>
  .doc-array-item {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    margin-top: 6px;
    background-color: var(--fds-card-background-default);
    box-shadow: inset 0 0 0 1px var(--fds-control-stroke-default);
    border-radius: var(--fds-control-corner-radius);
  }

  .doc-array-item:focus-visible {
    outline: none;
    box-shadow: var(--fds-focus-stroke);
  }

  .doc-array-item-detail {
    display: flex;
    flex-direction: column;
    padding: 10px;
    flex-grow: 1;
    width: 1px;
  }

  .buttons {
    display: flex;
    flex-direction: column;
  }
</style>
