<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { SchemaField } from '$lib/common/Field';
  import { blocksToProsemirror, notEmpty } from '$utils';
  import { addToY } from '$utils/y/addTToY';
  import { createYStore } from '$utils/y/createYStore.js';
  import { copy } from 'copy-anything';
  import { Button, InfoBar } from 'fluent-svelte';
  import { onDestroy, onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import type { Action } from '../[item_id]/+layout';

  export let data;

  const { collection } = data.params;

  const deconstructedSchema = copy(data.deconstructedSchema);

  const ystore = createYStore({
    collection: collection,
    id: `collection-${collection}___new_${Math.random().toString(36).substring(7)}`,
    user: data.yuser,
    deconstructedSchema: deconstructedSchema,
    // disable syncing via providers (disables collaborative editing)
    providerOpts: { noWebRtcConn: true, noWebsocketConn: true },
  });
  $: ({ ydoc, webProvider, wsProvider, awareness, synced, connected, sharedData, fullSharedData } =
    ystore);

  const defaultValues = Object.fromEntries(
    data.settings.defs
      .filter(([, def]) => def.default)
      .map(([key, def]) => {
        return [key, def.default];
      })
  );
  const docData = writable<Record<string, any>>(
    data.initialDocData ? data.initialDocData : defaultValues
  );
  const requiredFieldsLabelMap = Object.fromEntries(
    data.settings.defs.filter(([, def]) => def.required).map(([key, def]) => [key, def.field.label])
  );
  $: missingRequiredFields = Object.keys(requiredFieldsLabelMap).filter(
    (key) => $docData[key] === null || $docData[key] === undefined || $docData[key] === ''
  );

  let showCollapsedFields = false;
  let showHiddenFields = false;

  let createDocLoading = false;
  let actions: Action[] = [];
  $: actions = [
    {
      id: 'save',
      label: 'Save as new document',
      action: () => {
        if (createDocLoading) return;
        if (missingRequiredFields?.length > 0) return;
        createDocLoading = true;
        data.actions.createDoc({ data: $docData }).then((res) => {
          console.log(res);
          if (res.error) {
            alert('Error creating document: ' + JSON.stringify(res.error, null, 4));
          } else {
            goto(`/admin/cms/collection/${data.settings.uid}/${res.id}`);
          }
        });
      },
      disabled: missingRequiredFields?.length > 0,
      icon: 'Save20Regular',
      hint: 'Ctrl + Shift + S',
    },
  ];

  function keyboardShortcuts(evt: KeyboardEvent) {
    // trigger whether hidden fields are shown
    // ALT + SHIFT + H
    if (evt.altKey && evt.shiftKey && evt.key === 'H') {
      evt.preventDefault();
      showHiddenFields = !showHiddenFields;
      return;
    }

    // show the save doc dialog
    // CTRL + S
    if (evt.ctrlKey && evt.key === 'S') {
      evt.preventDefault();
      const saveAction = actions.find((action) => action.id === 'save');
      if (saveAction) saveAction.action(evt);

      return;
    }
  }
  onMount(() => {
    document.addEventListener('keydown', keyboardShortcuts);
  });
  onDestroy(() => {
    if (browser) document.removeEventListener('keydown', keyboardShortcuts);
  });

  let contentWidth = 1000;

  // update shared rich text with doc data
  let hasInitialDocData = false;
  $: if ($ydoc && !hasInitialDocData) {
    hasInitialDocData = true;

    const dataToSet = Object.fromEntries(
      (data.settings.defs || [])
        .map(([key, { type }]) => {
          if (type === 'blocks') {
            return [key, JSON.stringify(blocksToProsemirror($docData[key]) || [])];
          }
        })
        .filter(notEmpty)
    );

    addToY({
      ydoc: $ydoc,
      inputData: dataToSet,
      schemaDef: deconstructedSchema,
      onlyProvided: true,
    }).catch((error) => {
      console.error(error);
    });
  }
</script>

<div class="content-wrapper" bind:clientWidth={contentWidth} class:mobile={contentWidth <= 900}>
  <div class="document-fields">
    <div style="height: 100%; overflow: auto; display: flex; flex-direction: column;">
      <div style="display: block; height: 100%;">
        <div style="max-width: 800px; padding: 40px; margin: 0px auto;">
          {#each (data.settings.defs || []).filter(([key, { hidden }]) => {
            if (!data.checkPermissions('read', key)) return false;
            if (hidden) return showHiddenFields;
            return true;
          }) as [key, def]}
            <SchemaField
              {key}
              {def}
              {docData}
              collectionUID={data.settings.uid}
              session={data.session}
              {ystore}
              yuser={data.yuser}
              {deconstructedSchema}
              {actions}
              chips={def.required ? [{ label: 'Required', color: 'red' }] : []}
            />
          {/each}
        </div>
      </div>
    </div>
  </div>
  <aside class:mobile={contentWidth <= 900}>
    <Button
      variant="accent"
      on:click={actions.find((action) => action.id === 'save')?.action}
      disabled={missingRequiredFields.length > 0}
    >
      Create document
    </Button>

    {#if missingRequiredFields.length > 0}
      <InfoBar
        title="Cannot create document"
        severity="caution"
        closable={false}
        message="The following fields are required and have not been completed: "
      >
        <ul style="margin: 0; padding: 0 0 0 16px;">
          {#each missingRequiredFields.map((key) => requiredFieldsLabelMap[key] || key) as missingField}
            <li>{missingField}</li>
          {/each}
        </ul>
      </InfoBar>
    {/if}

    <InfoBar title="Temporary" severity="information" closable={false}
      >Changes are not saved until you click the <b>Create document</b> button.</InfoBar
    >
  </aside>
</div>

<style>
  .content-wrapper {
    display: flex;
    flex-direction: row;
    width: 100%;
    overflow: hidden;
    height: 100%;
    box-sizing: border-box;
  }

  .document-fields {
    min-width: 0;
    overflow: auto;
    /* flex-grow: 1; */
  }

  aside {
    --border-color: var(--color-neutral-light-200);
    border-left: 1px solid var(--border-color);
    width: 320px;
    height: 100%;
    overflow: hidden auto;
    padding: 20px;
    box-sizing: border-box;
    flex-grow: 0;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  @media (prefers-color-scheme: dark) {
    aside {
      --border-color: var(--color-neutral-dark-200);
    }
  }

  .content-wrapper.mobile {
    flex-direction: column-reverse;
  }

  aside.mobile {
    border-left: none;
    border-top: 1px solid var(--border-color);
    width: 100%;
    height: fit-content;
  }

  aside :global(.info-bar h5) {
    width: 100%;
  }
</style>
