<script lang="ts">
  import { page } from '$app/stores';
  import { Chip } from '$lib/common/Chip';
  import { formatBytes, formatISODate, genAvatar, hasKey } from '$utils';
  import type { colorType } from '$utils/theme/theme';
  import type { TableMeta } from '@tanstack/svelte-table';
  import type { ColumnDefBase } from '@tanstack/table-core/build/lib/types';
  import { TextBox } from 'fluent-svelte';
  import { writable, type Writable } from 'svelte/store';
  import type { getFileExplorerData } from './getFileExplorerData';

  type Store = Awaited<ReturnType<typeof getFileExplorerData>>;
  type StoreValue = Parameters<Parameters<Store['subscribe']>[0]>[0];
  type FoldersStoreValue = StoreValue['folders'];
  type FoldersStoreData = FoldersStoreValue['data'];
  type Folder = NonNullable<FoldersStoreData[number]>;
  type FilesStoreValue = StoreValue['files'];
  type FilesStoreData = FilesStoreValue['data'];
  type File = NonNullable<FilesStoreData>['docs'][number];
  type Doc = File;

  type CellContext = Parameters<
    Extract<NonNullable<ColumnDefBase<Doc>['cell']>, (props: any) => any>
  >[0] & { table: { options: { meta?: TableMeta<Doc> } } };

  export let info: CellContext;
  export let type: 'string' | 'checkbox' = 'string';
  export let key: string;
  export let def: {
    type: 'date' | 'shortdate' | 'passthrough' | 'user' | 'boolean' | 'size';
    column?: { chips?: boolean | { value: string | number; label?: string; color?: colorType }[] };
  };
  export let valueOverride = '';
  export let store: Store | undefined = undefined;

  export let editingCell = writable(-1);
  $: editMode = $editingCell === info.row.index;

  const fieldData = valueOverride || info.getValue() || '';

  // when the input first becomes available, focus it
  let inputElement: HTMLInputElement;
  $: if (inputElement) inputElement.focus();

  // save the change when focus leaves
  function handleSaveNameChange() {
    const newName = inputElement.value;
    const isFolder = isFolderDoc(info.row.original);

    if (isFolder) {
      fetch(`/strapi/upload/folders/${Math.abs(info.row.original.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${$page.data.session?.adminToken}`,
        },
        body: JSON.stringify({
          name: inputElement.value,
          parent: info.row.original.parent?.split('/').slice(-2, -1)[0] ?? null,
        }),
      }).then(() => {
        $store?.folders.refetch();
        $editingCell = -1;
      });
    } else {
      const data = new FormData();
      data.set('fileInfo', JSON.stringify({ name: newName }));

      fetch(`/strapi/upload?id=${Math.abs(info.row.original.id)}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${$page.data.session?.adminToken}`,
        },
        body: data,
      }).then(() => {
        $store?.files.refetch();
        $editingCell = -1;
      });
    }
  }

  function isFolderDoc(toCheck: File | Folder): toCheck is Folder {
    return !!toCheck && hasKey(toCheck, 'files');
  }
</script>

{#if type === 'checkbox'}
  __checkbox
{:else if key === 'name'}
  {#if editMode}
    <TextBox
      value={fieldData}
      bind:inputElement
      clearButton={false}
      on:outermousedown={handleSaveNameChange}
      on:keydown={(evt) => {
        if (evt.key === 'Enter') handleSaveNameChange();
      }}
    />
  {:else}
    {fieldData}
  {/if}
{:else if def.type === 'size'}
  {@const sizeBytes = parseFloat(`${fieldData}`) * 1000}
  {#if sizeBytes > 0}
    {formatBytes(sizeBytes, 0)}
  {/if}
{:else if def.type === 'user'}
  {@const name =
    fieldData.firstname || fieldData.lastname
      ? `${fieldData.firstname} ${fieldData.lastname}`.trim()
      : undefined}
  {@const _id = fieldData.id ? `${fieldData.id}` : undefined}
  {@const username = fieldData.username ? `${fieldData.username}` : undefined}
  {@const photo = fieldData.photo ? `${fieldData.photo}` : undefined}
  <div class="refs-wrapper" class:compact={info.table.options.meta?.compactMode}>
    {#if name && _id}
      <div class="ref-wrapper">
        <img
          src={photo ? photo : _id ? genAvatar(username || _id) : ''}
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
  {JSON.stringify({ key, ...fieldData })}
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
