<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { formatISODate, hasKey } from '$utils';
  import { diffArray } from 'array-differences';
  import AwesomeDebouncePromise from 'awesome-debounce-promise';
  import { ComboBox, InfoBar, TextBox, TextBoxButton } from 'fluent-svelte';
  import { isError, isString } from 'is-what';
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import type { Option } from '.';
  import SelectedOptions from './SelectedOptions.svelte';
  import { getReferenceOptions, type GetReferenceOptions } from './getReferenceOptions';
  import { populateReferenceValues } from './populateReferenceValues';

  export let options: Option[] | undefined = undefined;

  /**
   * Disables the field.
   */
  export let disabled = false;

  /**
   * The current values that are selected.
   *
   * If a value is provided without a label or it is missing fields are
   * are included in `reference.forceLoadFields` and there is a reference
   * definition provided, the component will attempt to populate the label
   * when a drag operation is not in progess.
   */
  export let selectedOptions: Option[] = [];
  $: if (!Array.isArray(selectedOptions)) selectedOptions = [];
  let populating = false;
  let populate: ((givenOptions: Option[], ref: GetReferenceOptions) => Promise<void>) | undefined =
    undefined;
  onMount(() => {
    let controller: AbortController | null = null;

    populate = AwesomeDebouncePromise(async (givenOptions: Option[], ref: GetReferenceOptions) => {
      const valuesAreMissingLabels = selectedOptions.some((opt) => !opt.label);
      const valuesAreMissingForcedFields = selectedOptions.some((opt) => {
        const optFields = Object.entries(opt)
          .filter(([, value]) => value !== undefined && value !== null)
          .map(([key]) => key);
        const forcedFields = [
          ...(referenceOpts?.forceLoadFields || []),
          ...(referenceOpts?.requiredFieldNames || []),
        ];
        return !forcedFields.every((field) => optFields.includes(field));
      });
      if (valuesAreMissingLabels || valuesAreMissingForcedFields) {
        // if populating is already in progress, we need to stop the other requests
        // before starting a new one
        if (populating === true) {
          controller?.abort();
          controller = null;
          populating = false;
        }

        // store the we are populating so we can prevent multiple requests
        populating = true;

        // create a new controller for the new request so it can be cancelled if needed
        controller = new AbortController();

        // populate the reference values for the selected option
        // and update the selected option with the new label
        await populateReferenceValues(
          givenOptions,
          ref.targetCollectionUid,
          ref.mainField,
          [...(ref.forceLoadFields || []), ...(ref.requiredFieldNames || [])],
          ref.token,
          controller.signal
        )
          .then((options) => {
            handleDragFinalize(options);
            populating = false;
          })
          .catch((err) => {
            if (isError(err) && err.message === 'Aborted') {
              // do nothing
            } else {
              populating = false;
            }
          });
      }
    }, 500);
  });
  $: if (referenceOpts) {
    const noShadowItems = selectedOptions.every((opt) => opt.isDndShadowItem !== true);
    if (noShadowItems && !populating) {
      populate?.(selectedOptions, referenceOpts);
    }
  }

  /**
   * The reference definition for a referenced collection.
   *
   * If provided, the component will search the specified collection for matches.
   */
  export let referenceOpts: GetReferenceOptions | undefined = undefined;

  const dispatch = createEventDispatcher();

  let oldSelectedOptions = selectedOptions;
  function handleDragFinalize(evt: CustomEvent<Option[]> | Option[]) {
    const newOptions = Array.isArray(evt) ? evt : evt.detail;
    selectedOptions = newOptions;

    // calculate the difference between the old options and the new options
    // so that a ydoc transaction can be created that only contains
    // the exact differences
    const diff = diffArray(oldSelectedOptions, newOptions || selectedOptions);
    if (diff.length === 0) return;

    // expose changes to selected options via change event
    if (!newOptions.some((opt) => opt.isDndShadowItem)) {
      const dispatchableNewOptions = newOptions.map((newOption) => {
        const { disabled, errorMessage, identifier, _id, ...propsToDispatch } = newOption;
        return propsToDispatch;
      });
      dispatch('change', dispatchableNewOptions);
    }

    // finally, update the old selected options
    oldSelectedOptions = newOptions || selectedOptions;
  }

  /**
   * The value inside the textbox that is displayed
   * when any value is allowed (instead of a set of options)
   */
  let textBoxValue = '';
  function handleTextKeyDown(evt: KeyboardEvent) {
    if (evt.key === 'Enter') {
      addTextValues(textBoxValue);
      textBoxValue = '';
    }
    if (evt.key === 'Esc') {
      textBoxValue = '';
    }
  }
  function addTextValues(textValue: string) {
    if (textValue.includes(';')) {
      const currentKeys = selectedOptions.map((val) => val._id);
      const newKeys = Array.from(
        // put in set so duplicates are removed
        new Set(
          textValue
            .split(';')
            .map((value) => value.trim())
            // prevent keys that already exist in `currentKeys`
            .filter((newKey) => currentKeys.every((currentKey) => currentKey !== newKey))
        )
      );

      handleDragFinalize([
        ...selectedOptions,
        ...newKeys.map((value) => ({ label: value, _id: value })),
      ]);
    } else if (textValue.includes(',')) {
      const currentKeys = selectedOptions.map((val) => val._id);
      const newKeys = Array.from(
        // put in set so duplicates are removed
        new Set(
          textValue
            .split(',')
            .map((value) => value.trim())
            // prevent keys that already exist in `currentKeys`
            .filter((newKey) => currentKeys.every((currentKey) => currentKey !== newKey))
        )
      );

      handleDragFinalize([
        ...selectedOptions,
        ...newKeys.map((value) => ({ label: value, _id: value })),
      ]);
    } else {
      handleDragFinalize([...selectedOptions, { label: textValue, _id: textValue }]);
    }

    // also update the shared type value
    handleDragFinalize(selectedOptions);
  }

  /**
   * Takes the `selectedOptions` array and converts it to an array of objects
   * accepted by the ComboBox component.
   */
  function toComboboxOption(opt: Option) {
    return {
      ...opt,
      name: opt.label || opt._id,
      value: opt._id,
      disabled: opt.disabled,
      errorMessage: opt.reason,
      identifier: (() => {
        if (hasKey(opt, 'publishedAt') && isString(opt.publishedAt)) {
          return 'Published ' + formatISODate(opt.publishedAt);
        }
        if (hasKey(opt, 'updatedAt') && isString(opt.updatedAt)) {
          return 'Updated ' + formatISODate(opt.updatedAt);
        } else if (opt._id) {
          return opt._id.slice(-7, opt._id.length);
        } else if (typeof opt._id === 'number' && `${opt._id}`.length < 4) {
          return `${opt._id}`;
        }
        return undefined;
      })(),
    };
  }

  const {
    searchValue,
    options: referenceOptions,
    loading,
    error,
  } = getReferenceOptions(referenceOpts);
  let referenceComboBoxWrapperElement: HTMLDivElement;
  let referenceComboBoxOpen = false;
  let referenceComboBoxValue = '';

  // if every option is 'undefined', it means that strapi is only sending
  // document ids because the user does not have permission to view the
  // reference collection (and therefore the labels)
  let maybeNoPermissionToViewReferenceCollection = false;
  $: if (
    $referenceOptions.length > 0 &&
    $referenceOptions.every((opt) => opt.label === 'undefined')
  ) {
    maybeNoPermissionToViewReferenceCollection = true;
  } else if ($error === 'NO_PERMISSION') {
    maybeNoPermissionToViewReferenceCollection = true;
  }
</script>

<!--
@component
Creates a multi-select dropdown/combobox.

The `on:change` event occurs when the text input changes.
The `on:select` event occurs when the selected values change. It fires upon selection and deselection.
-->

<!-- When a reference is provided, we search from reference docs to generate the options -->
{#if referenceOpts}
  {@const filteredReferenceItems = $referenceOptions
    .filter((opt) => !selectedOptions.map(({ _id }) => _id).includes(opt._id))
    .map(toComboboxOption)}
  {@const filteredOptionsItems = options
    ?.filter((opt) => !selectedOptions.map(({ _id }) => _id).includes(opt._id))
    .map(toComboboxOption)}

  {#if maybeNoPermissionToViewReferenceCollection}
    <div style="margin-bottom: 6px;">
      <InfoBar severity="information" closable={false} class="inline-infobar">
        You do not have permission to view labels in the referenced collection ({referenceOpts?.collectionUid}).
      </InfoBar>
    </div>
  {/if}
  <div
    bind:this={referenceComboBoxWrapperElement}
    on:focusin={() => {
      const hasFocusedChild = referenceComboBoxWrapperElement.matches(':focus-within:not(:focus)');
      if (hasFocusedChild) referenceComboBoxOpen = true;
    }}
    on:focusout={() => {
      const hasFocusedChild = referenceComboBoxWrapperElement.matches(':focus-within:not(:focus)');
      if (!hasFocusedChild) referenceComboBoxOpen = false;
    }}
  >
    <ComboBox
      bind:open={referenceComboBoxOpen}
      bind:value={referenceComboBoxValue}
      class="combobox-cristata"
      items={$loading || (!$searchValue && !referenceOpts.searchImmediately)
        ? []
        : [...filteredReferenceItems, ...(filteredOptionsItems || [])]}
      editable
      disableAutoSelectFromSearch
      disabled={disabled || populating}
      noItemsMessage={$loading
        ? 'Loading options...'
        : !!$searchValue
          ? 'No matches were found'
          : 'Start typing to view options'}
      bind:searchValue={$searchValue}
      on:input={() => {
        referenceComboBoxOpen = true;
      }}
      openOnFocus
      placeholder="Select..."
      on:select={(evt) => {
        if (!evt.detail) return;

        // if the value is already selected, do not add it to the list of selected values
        if (selectedOptions.find(({ _id }) => evt.detail.value === _id)) return;

        // otherwise, add it to the list
        const { name, value, ...rest } = evt.detail;
        handleDragFinalize([
          ...selectedOptions,
          {
            _id: value,
            ...rest,
            label: name,
            disabled: evt.detail.disabled,
          },
        ]);

        // clear the value of the combobox so that the most recently selected item can be removed from the list
        // (the component will re-select the best match based on the value)
        tick().then(() => {
          if (referenceOpts?.searchImmediately) {
            referenceComboBoxValue = '';
            return;
          }
          // we cannot use an empty string because the component does not act on falsy values
          referenceComboBoxValue = '__internal_empty__';
        });
      }}
    />
  </div>
  <!-- When options are provided, we allow selecting from the provided options -->
{:else if options}
  {@const filteredItems = options
    .filter((opt) => !selectedOptions.map(({ _id }) => _id).includes(opt._id))
    .map(toComboboxOption)}
  {#key filteredItems}
    <ComboBox
      items={filteredItems}
      {disabled}
      on:select={(evt) => {
        if (!evt.detail) return;

        // if the value is already selected, do not add it to the list of selected values
        if (selectedOptions.find(({ _id }) => evt.detail.value === _id)) return;

        // otherwise, add it to the list
        const { name, value, ...rest } = evt.detail;

        // and update the shared type value
        handleDragFinalize([
          ...selectedOptions,
          {
            _id: value,
            ...rest,
            label: name,
            disabled: evt.detail.disabled,
          },
        ]);
      }}
    />
  {/key}
{:else}
  <TextBox
    placeholder="Type a value and then click the arrow"
    bind:value={textBoxValue}
    on:keydown={handleTextKeyDown}
    {disabled}
  >
    <svelte:fragment slot="buttons">
      <TextBoxButton
        on:click={() => {
          addTextValues(textBoxValue);
          textBoxValue = '';
        }}
      >
        <FluentIcon name="ArrowRight12Regular" />
      </TextBoxButton>
    </svelte:fragment>
  </TextBox>
{/if}

<SelectedOptions
  bind:selectedOptions
  {disabled}
  {referenceOpts}
  {options}
  on:dragfinalize={handleDragFinalize}
  on:dismiss={handleDragFinalize}
  on:dismissall={handleDragFinalize}
  hideIds={!referenceOpts}
  {populating}
/>

<style>
  :global(.combobox-cristata) {
    width: 100%;
  }
</style>
