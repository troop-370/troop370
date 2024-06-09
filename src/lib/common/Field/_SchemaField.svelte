<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import { DateTime } from '$lib/common/DateTime';
  import { SelectMany, SelectOne } from '$lib/common/Select';
  import { RichTiptap } from '$lib/common/Tiptap';
  import { tiptapToStrapi } from '$utils/tiptapToStrapi';
  import type { AwarenessUser, createYStore } from '$utils/y/createYStore';
  import type { DeconstructedSchemaDefType } from '$utils/y/deconstructSchema';
  import { processSchemaDef } from '$utils/y/processSchemaDef';
  import { TextBox, ToggleSwitch } from 'fluent-svelte';
  import type { Writable } from 'svelte/store';
  import { FieldWrapper } from '.';
  import type { CollectionFieldDef } from '../../../routes/(admin)/admin/cms/collection/[collection]/+layout';
  import type { Action } from '../../../routes/(admin)/admin/cms/collection/[collection]/[item_id]/+layout';
  import StrapiUidField from '../StrapiUIDField/StrapiUIDField.svelte';

  export let key: string;
  export let mode: 'editor' | 'publish' | 'create' | 'sidebar' = 'editor';
  export let def: CollectionFieldDef;
  const field = def.field;
  export let docData: Writable<Record<string, any>>;
  export let collectionUID: string;
  export let session: Partial<SessionData>;
  export let ystore: ReturnType<typeof createYStore>;
  export let yuser: AwarenessUser;
  export let deconstructedSchema: DeconstructedSchemaDefType;
  export let actions: Action[];
  export let disabled = false;
  export let style = '';

  $: ({ ydoc, webProvider, wsProvider, awareness, synced, connected, sharedData, fullSharedData } =
    ystore);

  $: fullscreen =
    $page.url.searchParams.get('fs') === '1' ||
    $page.url.searchParams.get('fs') === '3' ||
    $page.url.searchParams.get('fs') === 'force';
  afterNavigate(() => {
    fullscreen =
      new URL(window.location.href).searchParams.get('fs') === '1' ||
      new URL(window.location.href).searchParams.get('fs') === '3' ||
      $page.url.searchParams.get('fs') === 'force';
  });
</script>

<FieldWrapper forId={key} label={field.label || key} description={field.description} {style}>
  {#if def.type === 'blocks'}
    {#if mode === 'sidebar'}
      <!-- hide field so it is not rendered in a sidebar, which would create infinite nesting -->
    {:else if !!$ydoc && !!$wsProvider && !!fullSharedData}
      <RichTiptap
        {disabled}
        {ydoc}
        ydocKey={key}
        {wsProvider}
        user={yuser}
        options={deconstructedSchema.find(([_key]) => _key === key)?.[1].field?.tiptap}
        {fullscreen}
        {processSchemaDef}
        {fullSharedData}
        dynamicPreviewHref=""
        {actions}
        {connected}
        on:change={(evt) => {
          const blocks = tiptapToStrapi(evt.detail.content);
          $docData[key] = blocks;
        }}
      >
        <svelte:fragment slot="alerts">
          <slot name="alerts" />
        </svelte:fragment>
      </RichTiptap>
    {:else}
      <p>
        Error: The collaborative document or websocket was not found ({key}).
      </p>
    {/if}
  {:else if fullscreen && mode === 'editor'}
    <!-- capture loop for all non-body fields when in fullscreen mode so they do not render -->
  {:else if key.includes('#')}
    Internal: {key}
  {:else if def.type === 'string'}
    <TextBox id={key} bind:value={$docData[key]} {disabled} />
  {:else if def.type === 'boolean'}
    <ToggleSwitch id={key} bind:checked={$docData[key]} {disabled} />
  {:else if def.type === 'uid'}
    <StrapiUidField
      {key}
      {docData}
      {collectionUID}
      sessionAdminToken={session.adminToken}
      {disabled}
    />
  {:else if def.type === 'relation' && def.target && field.mainField}
    {#if !!$ydoc && def.relationType === 'oneToOne'}
      <SelectOne
        {ydoc}
        ydocKey={key}
        {disabled}
        overwriteYDocValueWithInitialSelectedOptions
        referenceOpts={{
          collectionUid: collectionUID,
          targetCollectionUid: def.target,
          fieldId: key,
          entityId: $docData.id,
          token: session.adminToken,
          mainField: field.mainField,
          idsToInclude: [$docData[key]?.id],
          searchImmediately: true,
        }}
        selectedOption={$docData[key]
          ? {
              _id: $docData[key]?.id,
              label: $docData[key]?.[field.mainField],
            }
          : null}
        on:change={(evt) => {
          if (evt.detail) {
            $docData[key] = {
              id: evt.detail._id,
              [field.mainField]: evt.detail.label,
            };
          } else {
            $docData[key] = null;
          }
        }}
      />
    {:else if !!$ydoc && def.relationType === 'oneToMany'}
      <SelectMany
        {ydoc}
        ydocKey={key}
        {disabled}
        overwriteYDocValueWithInitialSelectedOptions
        referenceOpts={{
          collectionUid: collectionUID,
          targetCollectionUid: def.target,
          fieldId: key,
          entityId: $docData.id,
          token: session.adminToken,
          mainField: field.mainField,
          pageSize: 100,
          idsToInclude: [$docData[key]?.id],
          searchImmediately: true,
        }}
        selectedOptions={$docData[key].map((opt) => {
          if (!field.mainField) return { _id: opt.id };
          return {
            _id: opt.id,
            label: opt?.[field.mainField],
          };
        })}
        on:change={(evt) => {
          $docData[key] = evt.detail.map((opt) => ({
            id: opt._id,
            [field.mainField]: opt.label,
          }));
        }}
      />
    {:else}
      <p>Error: The reference field could not be loaded.</p>
      <pre>{JSON.stringify($docData[key], null, 2)}</pre>
    {/if}
  {:else if def.type === 'date'}
    {@const [year, month, day] = $docData[key]?.split('-')?.map(Number) || []}
    <DateTime
      {disabled}
      {ydoc}
      ydocKey={key}
      hideTime={true}
      {year}
      {month}
      {day}
      on:change={(evt) => {
        $docData[key] = evt.detail.split('T')[0];
      }}
    />
  {:else if def.type === 'datetime'}
    {@const [date, time] = $docData[key]?.split('T') || []}
    {@const [year, month, day] = date?.split('-')?.map(Number) || []}
    <DateTime
      {disabled}
      {ydoc}
      ydocKey={key}
      {year}
      {month}
      {day}
      {time}
      on:change={(evt) => {
        $docData[key] = evt.detail;
      }}
    />
  {:else}
    Unsupported content type: "{def.type}"
    <pre>{JSON.stringify(def, null, 2)}</pre>
    <pre>{JSON.stringify($docData[key], null, 2)}</pre>
  {/if}
</FieldWrapper>
