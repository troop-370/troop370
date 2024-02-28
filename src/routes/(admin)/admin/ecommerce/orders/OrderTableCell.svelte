<script lang="ts">
  import { invalidate } from '$app/navigation';
  import { compactMode } from '$stores/compactMode';
  import { capitalize } from '$utils';
  import type { CellContext } from '@tanstack/svelte-table';
  import { ProgressRing } from 'fluent-svelte';
  import { fulfillmentStatuses, paymentStatuses } from '../ecwidSchemas';

  export let info: CellContext<any, unknown>;
  export let valueOverride = '';
  export let tableLoading = false;

  $: fieldData = valueOverride || info.getValue() || '';
  $: orderId = info.row.original.id;

  let saving = false;

  async function saveChange(change: Record<string, unknown>) {
    saving = true;
    await fetch(`/admin/ecommerce/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ id: orderId, ...change }),
    })
      .then(async () => {
        await invalidate('order-page');
        await invalidate('order-table');
      })
      .finally(async () => {
        await new Promise<void>((resolve, reject) => {
          let attempts = 0;

          setTimeout(() => {
            if (!tableLoading) resolve();
            attempts++;
          }, 500);

          if (attempts > 120) reject();
        });

        saving = false;
      });
  }

  $: selectedOption = fieldData;

  function stopPropagation(evt: Event) {
    evt.stopPropagation();
    evt.preventDefault();
  }
</script>

{#if saving}
  <div class="progress-wrapper">
    <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
  </div>
{:else}
  <div class="wrapper">
    {#if info.column.id === 'paymentStatus'}
      <div class="text-box-container" class:compact={$compactMode}>
        <select
          on:click={stopPropagation}
          on:dblclick={stopPropagation}
          bind:value={selectedOption}
          on:change={() => saveChange({ paymentStatus: selectedOption })}
        >
          {#each paymentStatuses as status}
            <option value={status}>
              {capitalize(status.toLowerCase().replaceAll('_', ' '))}
            </option>
          {/each}
        </select>
        <div class="text-box-underline svelte-1yv8oe6" />
      </div>
    {:else if info.column.id === 'fulfillmentStatus'}
      <div
        class="text-box-container"
        class:compact={$compactMode}
        on:change={() => saveChange({ fulfillmentStatus: selectedOption })}
      >
        <select
          on:click={stopPropagation}
          on:dblclick={stopPropagation}
          bind:value={selectedOption}
        >
          {#each fulfillmentStatuses as status}
            <option value={status}>{capitalize(status.toLowerCase().replaceAll('_', ' '))}</option>
          {/each}
        </select>
        <div class="text-box-underline svelte-1yv8oe6" />
      </div>
    {:else}
      {fieldData}
    {/if}
  </div>
{/if}

<style>
  .wrapper {
    height: 100%;
  }

  .progress-wrapper {
    height: 100%;
    padding-left: 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .text-box-container {
    align-items: center;
    background-clip: padding-box;
    background-color: var(--fds-control-fill-default);
    border-radius: var(--fds-control-corner-radius);
    cursor: text;
    display: flex;
    inline-size: 100%;
    position: relative;
    block-size: 100%;
    max-height: 30px;
    margin-top: 6px;
  }
  .text-box-container.compact {
    max-height: unset;
    margin-top: 0;
  }

  .text-box-container:not(:hover):not(:active):not(:focus-within) {
    background-color: transparent;
    box-shadow: none;
  }

  .text-box-underline {
    border-radius: var(--fds-control-corner-radius);
    overflow: hidden;
    pointer-events: none;
    position: absolute;
  }
  .text-box-container:not(:hover):not(:active):not(:focus-within) .text-box-underline::after {
    box-shadow: none;
  }

  select {
    appearance: none;
    background-size: 16px;
    background-repeat: no-repeat;
    background-position: right 10px bottom 50%;
    border: none;
    background-color: transparent;
    height: 100%;
    width: 100%;
    padding-inline: 10px;
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    color-scheme: light dark;
  }
  select:hover,
  select:focus {
    background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNC4yOTMgOC4yOTNhMSAxIDAgMCAxIDEuNDE0IDBMMTIgMTQuNTg2bDYuMjkzLTYuMjkzYTEgMSAwIDEgMSAxLjQxNCAxLjQxNGwtNyA3YTEgMSAwIDAgMS0xLjQxNCAwbC03LTdhMSAxIDAgMCAxIDAtMS40MTRaIiBmaWxsPSIjMDAwMDAwIi8+PC9zdmc+');
  }
  @media (prefers-color-scheme: dark) {
    select:hover,
    select:focus {
      background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNC4yOTMgOC4yOTNhMSAxIDAgMCAxIDEuNDE0IDBMMTIgMTQuNTg2bDYuMjkzLTYuMjkzYTEgMSAwIDEgMSAxLjQxNCAxLjQxNGwtNyA3YTEgMSAwIDAgMS0xLjQxNCAwbC03LTdhMSAxIDAgMCAxIDAtMS40MTRaIiBmaWxsPSIjZmZmZmZmIi8+PC9zdmc+');
    }
  }
  select:focus {
    outline: none;
  }

  option {
    background-color: var(--fds-solid-background-quarternary);
    border: 1px solid var(--fds-surface-stroke-flyout);
    font-family: var(--fds-font-family-text);
    font-size: var(--fds-body-font-size);
  }
</style>
