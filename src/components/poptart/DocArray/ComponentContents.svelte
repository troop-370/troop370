<script lang="ts">
  import { isNumber, isString } from 'is-what';
  import type { ComponentProps } from 'svelte';
  import type { DocDataStore } from '../../../routes/(admin)/poptart/cms/collection/[uid]/[documentId]/+page';
  import FieldsSvelteComponent from '../../../routes/(admin)/poptart/cms/collection/[uid]/[documentId]/Fields.svelte';
  import Component from './Component.svelte';

  interface FieldsComponentProps {
    sessionAdminToken: ComponentProps<FieldsSvelteComponent>['sessionAdminToken'];
    variant: ComponentProps<FieldsSvelteComponent>['variant'];
    defs: { componentUID: string; defs: ComponentProps<FieldsSvelteComponent>['defs'] }[];
    parentKeyPathLabel: string;
  }

  export let collapsed: ComponentProps<Component>['collapsed'];
  export let fieldsComponentProps: FieldsComponentProps;
  export let docData: DocDataStore;
  export let componentUID: string;
  export let index: number;
  export let disabled = false;

  const defs =
    fieldsComponentProps.defs?.find((spec) => spec.componentUID === componentUID)?.defs || null;
</script>

{#if collapsed}
  {#each Object.entries($docData).filter(([key]) => key !== 'id') as [detailKey, detailData]}
    {@const defArr = defs?.find(([key, def]) => key === detailKey)}
    <div class="doc-array-item-detail-grid">
      <span style="color: var(--fds-text-secondary);">{defArr?.[1]?.label || detailKey}</span>
      <span class="doc-array-item-detail-data">
        {#if Array.isArray(detailData)}
          {detailData.length} item{detailData.length === 1 ? '' : 's'}
        {:else}
          {detailData}
        {/if}
      </span>
    </div>
  {/each}
{:else}
  {@const id = (() => {
    if (isNumber($docData.id)) return $docData.id.toString();
    if (isString($docData.id)) return $docData.id;
    return '';
  })()}
  {#if defs}
    <FieldsSvelteComponent
      {disabled}
      sessionAdminToken={fieldsComponentProps.sessionAdminToken}
      variant={fieldsComponentProps.variant}
      {defs}
      {docData}
      parentKeyPathLabel={(() => {
        if (fieldsComponentProps.parentKeyPathLabel.endsWith('NOTARRAY')) {
          return fieldsComponentProps.parentKeyPathLabel.slice(0, -8);
        }
        if (fieldsComponentProps.parentKeyPathLabel.endsWith('.')) {
          return fieldsComponentProps.parentKeyPathLabel.slice(0, -1) + `[${index}].`;
        }
        return fieldsComponentProps.parentKeyPathLabel + `[${index}].`;
      })()}
      relationCurrentDocumentId={id.startsWith('NEW_') ? '' : id}
      collectionUID={componentUID}
    />
  {/if}
{/if}

<style>
  .doc-array-item-detail-grid {
    display: flex;
    flex-direction: row;
    gap: 10px;
    margin: 2px 0px;
    font-size: 13px;
    line-height: 16px;
    font-family: var(--fds-font-family-text);
  }

  .doc-array-item-detail-data {
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
