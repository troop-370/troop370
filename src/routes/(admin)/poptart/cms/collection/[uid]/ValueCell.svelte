<script lang="ts">
  import { Chip } from '$lib/common/Chip';
  import { formatISODate, genAvatar } from '$utils';
  import type { colorType } from '$utils/theme/theme';
  import type { CellContext } from '@tanstack/svelte-table';

  export let info: CellContext<any, unknown>;
  export let type: 'string' | 'checkbox' = 'string';
  export let key: string;
  export let def: {
    type: 'date' | 'shortdate' | 'passthrough' | 'user';
    column?: { chips?: boolean | { value: string | number; label?: string; color?: colorType }[] };
  };
  export let valueOverride = '';

  const fieldData = valueOverride || info.getValue() || '';
</script>

{#if type === 'checkbox'}
  __checkbox
{:else if def.type === 'user'}
  {@const name =
    fieldData.firstname || fieldData.lastname
      ? `${fieldData.firstname} ${fieldData.lastname}`.trim()
      : undefined}
  {@const _id = fieldData.id ? `${fieldData.id}` : undefined}
  {@const photo = fieldData.photo ? `${fieldData.photo}` : undefined}
  <div class="refs-wrapper" class:compact={info.table.options.meta?.compactMode}>
    {#if name && _id}
      <div class="ref-wrapper">
        <img
          src={photo ? photo : _id ? genAvatar(_id) : ''}
          alt=""
          style="width: 20px; height: 20px; border-radius: 50%;"
        />
        <span>{name || _id}</span>
      </div>
    {/if}
  </div>
{:else if Array.isArray(fieldData)}
  <div class="chips-wrapper" class:compact={info.table.options.meta?.compactMode}>
    {#each fieldData as entry}
      {@const stringValue = (() => {
        try {
          return entry.toString();
        } catch {
          return JSON.stringify(entry);
        }
      })()}
      {#if def.column?.chips}
        {#if typeof def.column.chips === 'boolean'}
          <Chip color="neutral" data-value={stringValue}>{stringValue}</Chip>
        {:else}
          {@const match = def.column.chips.find((s) => s.value === stringValue)}
          <Chip color={match?.color || 'neutral'} data-value={stringValue}>
            {match?.label || stringValue.replace('stage__', '_')}
          </Chip>
        {/if}
      {:else}
        {stringValue}
      {/if}
    {/each}
  </div>
{:else if typeof fieldData === 'string'}
  <!-- DATE FIELDS -->
  {#if def.type === 'date' || def.type === 'shortdate'}
    <!-- this is the default date -->
    {#if fieldData === '0001-01-01T01:00:00.000+00:00' || fieldData === '0001-01-01T01:00:00.000Z'}
      {''}
    {:else}
      {formatISODate(fieldData, false, true, def.type === 'date')}
    {/if}
    <!-- CHIPS -->
  {:else if def.column?.chips}
    {#if typeof def.column.chips === 'boolean'}
      <div class="chips-wrapper" class:compact={info.table.options.meta?.compactMode}>
        <Chip color={'neutral'} data-value={fieldData}>
          {fieldData}
        </Chip>
      </div>
    {:else}
      {@const match = def.column.chips.find((s) => s.value === fieldData)}
      <div class="chips-wrapper" class:compact={info.table.options.meta?.compactMode}>
        <Chip color={match?.color || 'neutral'} data-value={fieldData}>
          {match?.label || fieldData}
        </Chip>
      </div>
    {/if}
  {:else}
    {fieldData}
  {/if}
{:else if typeof fieldData === 'number'}
  {#if def.column?.chips}
    {#if typeof def.column.chips === 'boolean'}
      <div class="chips-wrapper" class:compact={info.table.options.meta?.compactMode}>
        <Chip color={'neutral'} data-value={fieldData}>
          {fieldData}
        </Chip>
      </div>
    {:else}
      {@const match = def.column.chips.find((s) => s.value === fieldData)}
      <div class="chips-wrapper" class:compact={info.table.options.meta?.compactMode}>
        <Chip color={match?.color || 'neutral'} data-value={fieldData}>
          {match?.label || fieldData}
        </Chip>
      </div>
    {/if}
  {:else}
    {fieldData}
  {/if}
{:else}
  <!-- 

  OBJECTS AND ARRAYS
  
  -->
  {JSON.stringify(fieldData)}
{/if}

<style>
  .chips-wrapper {
    display: flex;
    flex-direction: row;
    gap: 6px;
    margin: 2px 0;
    flex-wrap: wrap;
  }

  .chips-wrapper.compact {
    flex-wrap: nowrap;
    gap: 3px;
  }

  .refs-wrapper {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 2px 0;
  }

  .refs-wrapper.compact {
    flex-direction: row;
  }

  .ref-wrapper {
    display: flex;
    align-items: center;
    gap: 6px;
  }
</style>
