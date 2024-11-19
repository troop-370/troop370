<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { getProperty, slugify } from '$utils';
  import { Button, MenuFlyout, MenuFlyoutItem, Tooltip } from 'fluent-svelte';
  import { merge } from 'merge-anything';
  import { createEventDispatcher, onMount, tick, type ComponentProps } from 'svelte';
  import { dndzone, SOURCES, TRIGGERS, type DndEvent } from 'svelte-dnd-action';
  import { v4 as uuidv4 } from 'uuid';
  import type { DocDataStore } from '../../../routes/(admin)/poptart/cms/collection/[uid]/[documentId]/+page';
  import Item from './Component.svelte';
  import ComponentContents from './ComponentContents.svelte';

  export let componentUIDs: string[];
  export let componentSettings:
    | Record<string, { displayName: string; more: Record<string, unknown> }>
    | undefined = undefined;
  export let disabled = false;
  export let fieldsComponentProps: ComponentProps<ComponentContents>['fieldsComponentProps'];
  export let maxLength = 100;

  type YArr = Record<string, unknown> & {
    __uuid: string;
    _id: string;
    __collapsed?: boolean;
    __docData?: DocDataStore;
    __componentUID: string;
  };
  export let arr: YArr[] = [];

  // ensure there are no dupicates
  $: (() => {
    const unique: YArr[] = [];
    arr.forEach((value) => {
      if (!unique.map(({ _id }) => _id).includes(value._id)) unique.push(value);
    });
    if (arr.length !== unique.length) arr = [...unique];
  })();

  function addDoc(componentUID: string) {
    const keysToAdd: string[] = [];

    const __uuid = 'NEW_' + uuidv4();
    const newEmptyDoc: YArr = merge(
      { __uuid: __uuid, _id: __uuid, __componentUID: componentUID },
      ...keysToAdd.map((key) => ({ [key]: undefined }))
    );

    dispatch('add', [...arr, newEmptyDoc]);
  }

  const dispatch = createEventDispatcher<{
    dismiss: YArr[];
    dismissall: YArr[];
    dragfinalize: YArr[];
    add: YArr[];
  }>();

  const flipDurationMs = 200;
  let dragging = false;
  function handleDndConsider(evt: CustomEvent<DndEvent<YArr>>) {
    // Ensure dragging is stopped on drag finish via keyboard
    if (
      evt.detail.info.source === SOURCES.KEYBOARD &&
      evt.detail.info.trigger === TRIGGERS.DRAG_STOPPED
    ) {
      dragging = false;
    }
    // update the options
    arr = evt.detail.items;
  }
  function handleDndFinalize(evt: CustomEvent<DndEvent<YArr>>) {
    // Ensure dragging is stopped on drag finish via pointer (mouse, touch)
    if (evt.detail.info.source === SOURCES.POINTER) {
      dragging = false;
    }
    // update the options
    arr = evt.detail.items;
    dispatch('dragfinalize', evt.detail.items);
  }
  function startDrag(evt: Event) {
    // preventing default to prevent lag on touch devices (because of the browser checking for screen scrolling)
    evt.preventDefault();
    dragging = true;
  }
  function stopDrag(evt: Event) {
    evt.preventDefault();
    dragging = false;
  }
  function handleKeyDown(evt: KeyboardEvent) {
    if (
      (evt.key === 'Enter' || evt.key === ' ') &&
      (evt.target as HTMLElement | null)?.classList.contains('doc-array-item')
    ) {
      evt.preventDefault();
      if (!dragging) {
        dragging = true;
        tick().then(() => {
          (evt.target as HTMLElement | null)?.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Enter' })
          );
        });
      }
    }
  }

  // Keep track of whether the area is marked as a valid drop location
  let selectedListElement: HTMLDivElement;
  let isPendingDropLocation = false;
  onMount(() => {
    const attrObserver = new MutationObserver((mutations) => {
      mutations.forEach((mu) => {
        if (mu.type !== 'attributes' && mu.attributeName !== 'class') return;

        const classList = (mu.target as HTMLDivElement).classList;
        if (classList && Array.from(classList).includes('can-drop-here'))
          isPendingDropLocation = true;
        else isPendingDropLocation = false;
      });
    });

    attrObserver.observe(selectedListElement, { attributes: true });
  });

  function handleCollapse(evt: CustomEvent<boolean>, index: number) {
    if (!disabled) {
      arr[index].__collapsed = evt.detail;
    }
  }

  $: maxLengthSurpassed = arr.length >= maxLength;
  let flyoutOpen = false;
</script>

<div
  bind:this={selectedListElement}
  class="doc-array-list"
  use:dndzone={{
    items: arr,
    dragDisabled: disabled || !dragging,
    flipDurationMs,
    dropTargetStyle: {},
    dropTargetClasses: ['can-drop-here'],
    type: slugify(`doc-array.${componentUIDs}`),
    dropFromOthersDisabled: maxLengthSurpassed || true,
  }}
  on:consider={handleDndConsider}
  on:finalize={handleDndFinalize}
>
  {#each arr as { _id }, index (_id)}
    {@const collapsed = getProperty(arr, `${index}.__collapsed`) === true}
    <Item
      on:keydown={handleKeyDown}
      on:startdrag={(evt) => startDrag(evt.detail)}
      on:stopdrag={(evt) => stopDrag(evt.detail)}
      on:dismiss={() => {
        const newArr = arr.filter((value) => value._id !== _id);
        console.log(newArr[0] ?? null);
        dispatch('dismiss', newArr);
      }}
      draggable
      {dragging}
      {disabled}
      {collapsed}
      on:collapse={(evt) => {
        handleCollapse(evt, index);
      }}
    >
      {#if arr[index].__docData}
        <ComponentContents
          {fieldsComponentProps}
          docData={arr[index].__docData}
          {collapsed}
          componentUID={arr[index].__componentUID}
          {index}
          {disabled}
        />
      {/if}
    </Item>
  {/each}
</div>

<div class="doc-array-actions">
  <MenuFlyout alignment="start" bind:open={flyoutOpen}>
    <svelte:fragment slot="flyout">
      {#each componentUIDs as componentUID}
        <MenuFlyoutItem on:click={() => addDoc(componentUID)}>
          <FluentIcon name="Add16Regular" mode="buttonIconLeft" />
          {#if componentSettings}
            Add {componentSettings[componentUID]?.['displayName'] || componentUID}
          {:else}
            Add {componentUID}
          {/if}
        </MenuFlyoutItem>
      {/each}
    </svelte:fragment>
  </MenuFlyout>

  <Tooltip
    placement="auto"
    alignment="start"
    followCursor
    offset={0}
    wrapperElementClass={maxLengthSurpassed ? 'tooltip-enabled' : ''}
  >
    <svelte:fragment slot="tooltip">
      {#if maxLengthSurpassed}
        <span>
          There may only be {maxLength} document{maxLength === 1 ? '' : 's'}.
          <br />
          <i>Remove a document to add more.</i>
        </span>
      {/if}
    </svelte:fragment>
    <Button
      on:click={() => {
        if (componentUIDs.length === 1) addDoc(componentUIDs[0]);
        else flyoutOpen = true;
      }}
      disabled={disabled || maxLengthSurpassed}
    >
      <FluentIcon name="Add16Regular" mode="buttonIconLeft" />
      Add document
    </Button>
  </Tooltip>
</div>

<style>
  .doc-array-actions {
    display: flex;
    flex-direction: row;
    padding: 6px 0 0 0;
  }

  .doc-array-actions :global(.tooltip-enabled) {
    cursor: help;
  }

  .doc-array-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .doc-array-list:global(.can-drop-here) {
    border-radius: var(--fds-control-corner-radius);
    outline: 2px solid var(--fds-accent-default);
    min-height: 62px;
  }
</style>
