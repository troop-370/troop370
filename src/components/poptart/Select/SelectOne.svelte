<script lang="ts">
  import { browser } from '$app/environment';
  import { formatISODate, hasKey, isObjectId } from '$utils';
  import AwesomeDebouncePromise from 'awesome-debounce-promise';
  import { ComboBox, InfoBar } from 'fluent-svelte';
  import { isError, isString } from 'is-what';
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import type { Option } from '.';
  import Loading from '../Loading.svelte';
  import SelectedOption from './SelectedOption.svelte';
  import { getReferenceOptions, type GetReferenceOptions } from './getReferenceOptions';
  import { handleOpenReference } from './handleOpenReference';
  import { populateReferenceValues } from './populateReferenceValues';

  export let options: Option[] | undefined = undefined;

  /**
   * Disables the field.
   */
  export let disabled = false;

  /**
   * The current value that is selected.
   *
   * If a value is provided without a label and there is a reference definition
   * provided, the component will attempt to populate the label.
   */
  export let selectedOption: Option | null = null;

  // populate the selected option if it is missing labels
  let populating = false;
  let populate: ((givenOptions: Option[], ref: GetReferenceOptions) => Promise<void>) | undefined =
    undefined;
  onMount(() => {
    let controller: AbortController | null = null;

    populate = AwesomeDebouncePromise(async (givenOptions: Option[], ref: GetReferenceOptions) => {
      const valueIsMissingLabels = !selectedOption?.label;
      if (valueIsMissingLabels) {
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
          ref.requiredFieldNames,
          ref.token,
          controller.signal
        )
          .then((options) => {
            handleUpdateOption(options[0]);
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
  $: if (referenceOpts && selectedOption && browser) {
    populate?.([selectedOption], referenceOpts);
  }

  /**
   * The reference definition for a referenced collection.
   *
   * If provided, the component will search the specified collection for matches.
   */
  export let referenceOpts: GetReferenceOptions | undefined = undefined;

  /**
   * Instead of showing a selected item preview box,
   * just show the name of the selected item in the dropdown field
   */
  export let showCurrentSelectionOnDropdown = false;

  /**
   * Specifiy whether selected items should be hidden from the options.
   *
   * @default true
   */
  export let hideSelected = true;

  const dispatch = createEventDispatcher();

  let oldSelectedOption = selectedOption;
  function handleUpdateOption(newOption: Option | null) {
    selectedOption = newOption;

    // don't attempt to dispatch and update if the option is the same
    const isDifferent = JSON.stringify(oldSelectedOption) !== JSON.stringify(newOption);
    if (!isDifferent) return;

    // expose changes to selected options via change event
    if (newOption) {
      const { disabled, errorMessage, identifier, _id, ...propsToDispatch } = newOption || {};
      dispatch('change', propsToDispatch);
    } else {
      dispatch('change', null);
    }

    // finally, update the old selected option
    oldSelectedOption = newOption;
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
      disabled: opt.disabled || opt._id === selectedOption?._id,
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

  const { searchValue, options: referenceOptions, loading } = getReferenceOptions(referenceOpts);
  let referenceComboBoxWrapperElement: HTMLDivElement;
  let referenceComboBoxOpen = false;
  let referenceComboBoxValue = '';

  // if every option is 'undefined', it means that strapi is only sending
  // document ids because the user does not have permission to view the
  // reference collection (and therefore the labels)
  let maybeNoPermissionToViewReferenceCollection = false;
  $: if ($referenceOptions.length > 0) {
    if ($referenceOptions.every((opt) => opt.label === 'undefined')) {
      maybeNoPermissionToViewReferenceCollection = true;
    }
  }
</script>

{#if maybeNoPermissionToViewReferenceCollection}
  <div style="margin-bottom: {selectedOption ? 0 : 6}px;">
    <InfoBar severity="information" closable={false} class="inline-infobar">
      You do not have permission to view labels in the referenced collection ({referenceOpts?.collectionUid}).
    </InfoBar>
  </div>
{/if}

{#if selectedOption && !showCurrentSelectionOnDropdown}
  <div class="selected-option-area">
    <SelectedOption
      _id={selectedOption._id}
      label={selectedOption.label}
      {disabled}
      on:dismiss={() => {
        handleUpdateOption(null);
      }}
      openable={!!referenceOpts}
      on:open={() => {
        if (selectedOption?._id && referenceOpts) {
          handleOpenReference(selectedOption._id, referenceOpts);
        }
      }}
    />
    {#if populating}
      <Loading message="Populating values..." />
    {/if}
  </div>
{:else if referenceOpts}
  {@const filteredReferenceItems = $referenceOptions
    .filter((opt) => (hideSelected ? opt._id !== selectedOption?._id : true))
    .map(toComboboxOption)}
  {@const filteredOptionsItems = options
    ?.filter((opt) => opt._id !== selectedOption?._id)
    .map(toComboboxOption)}
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
      {disabled}
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

        const { name, value, ...rest } = evt.detail;
        handleUpdateOption({ label: name, _id: value, ...rest });

        // clear the value of the combobox so that the most recently selected item can be removed from the list
        // (the component will re-select the best match based on the value)
        if (!showCurrentSelectionOnDropdown) {
          tick().then(() => {
            if (referenceOpts?.searchImmediately) {
              referenceComboBoxValue = '';
              return;
            }
            // we cannot use an empty string because the component does not act on falsy values
            referenceComboBoxValue = '__internal_empty__';
          });
        }
      }}
    />
  </div>
  <!-- When options are provided, we allow selecting from the provided options -->
{:else if options}
  {@const filteredItems = options
    .filter((opt) => (hideSelected ? opt._id !== selectedOption?._id : true))
    .map(toComboboxOption)}
  {#key filteredItems}
    <ComboBox
      class="combobox-cristata"
      items={filteredItems}
      placeholder={showCurrentSelectionOnDropdown && selectedOption
        ? selectedOption.label
        : 'Select...'}
      {disabled}
      on:select={(evt) => {
        if (!evt.detail) return;

        const { name, value, ...rest } = evt.detail;
        handleUpdateOption({ label: name, _id: value, ...rest });
      }}
    />
  {/key}
{/if}

<style>
  :global(.combobox-cristata) {
    width: 100%;
  }

  .selected-option-area {
    position: relative;
    width: 100%;
  }
  .selected-option-area > :global(.loading-message) {
    position: absolute;
    inset: 6px 10px 0;
  }
  .selected-option-area:has(.loading-message) :global(.selected-item > *) {
    visibility: hidden;
  }
</style>
