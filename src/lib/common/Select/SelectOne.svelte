<script lang="ts">
  import { browser } from '$app/environment';
  import { isObjectId } from '$utils';
  import type { YStore } from '$utils/y/createYStore';
  import { ComboBox } from 'fluent-svelte';
  import { createEventDispatcher, tick } from 'svelte';
  import type * as Y from 'yjs';
  import type { Option, YDocOption } from '.';
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
   * A yjs document that should be updated with the values of this field.
   */
  export let ydoc: YStore['ydoc'] | undefined = undefined;
  export let ydocKey: string = '';

  // this will be updated by a subscription to ydoc, which is why this is not marked reactive
  let yarray = $ydoc?.getArray<YDocOption<string>>(ydocKey);

  /**
   * The current value that is selected.
   *
   * If a value is provided without a label and there is a reference definition
   * provided, the component will attempt to populate the label.
   */
  export let selectedOption: Option | null = null;
  $: if (referenceOpts && selectedOption && browser) {
    const valueIsMissingLabels = !selectedOption?.label;
    if (valueIsMissingLabels) {
      populateReferenceValues(
        [selectedOption],
        referenceOpts.targetCollectionUid,
        referenceOpts.mainField,
        referenceOpts.requiredFieldNames,
        referenceOpts.token
      ).then((options) => {
        selectedOption = options[0];
      });
    }
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

  // expose changes to selected options via change event
  const dispatch = createEventDispatcher();
  $: dispatch('change', selectedOption);

  let oldSelectedOption = selectedOption;
  function handleUpdateOption(newOption: Option | null) {
    if (!$ydoc) return;

    // don't attempt to update the shared type value if there is no difference
    const isDifferent =
      JSON.stringify(oldSelectedOption) !== JSON.stringify(newOption || selectedOption);
    if (!isDifferent) return;

    // update the ydoc shared type value
    $ydoc.transact(() => {
      if (!yarray) return;

      // check that the old option was not already null so that
      // we do not try to delete an array entry that does not exist
      if (yarray.toArray().length > 0) {
        // remove from existing location
        yarray.delete(0);
      }

      // only handle new option value if it is not null
      if (newOption === null) return;

      const { _id, ..._option } = newOption;
      const option: YDocOption<string> = {
        ..._option,
        label: _option.label || _id,
        value: _id,
      };

      // add to new location
      yarray.insert(0, [option]);
    });

    // finally, update the old selected option
    oldSelectedOption = newOption || selectedOption;
  }

  /**
   * Handle changes to y array shared type by updating the selected options and old selected options
   */
  function handleYArrayChange(evt: Y.YArrayEvent<YDocOption<string>>) {
    const yarray = $ydoc?.getArray<YDocOption<string>>(ydocKey);

    if (yarray && evt.changes.delta) {
      const sharedOption = yarray.toArray().map(convertToOption)[0] || null;
      selectedOption = sharedOption;
      oldSelectedOption = sharedOption;
    }
  }

  /**
   * Converts an option of type `YDocOption` to an option of type `Option`.
   */
  function convertToOption({ value, ...option }: YDocOption<string>): Option {
    return {
      ...option,
      _id: value,
    };
  }

  // listen for changes in the array shared type
  ydoc?.subscribe(
    ($ydoc) => {
      yarray = $ydoc?.getArray<YDocOption<string>>(ydocKey);
      if (!yarray) return;

      // ensure the initial value matches the shared type value
      const sharedOption = yarray.toArray().map(convertToOption)[0] || null;
      const isDifferent = JSON.stringify(selectedOption) !== JSON.stringify(sharedOption);
      if (isDifferent) {
        selectedOption = sharedOption;
        oldSelectedOption = sharedOption;
      }

      yarray.observe(handleYArrayChange);
    },
    () => {
      // stop listening for changes in the array shared type
      // during cleanup to prevent memory leaks
      yarray?.unobserve(handleYArrayChange);
    }
  );

  /**
   * Takes the `selectedOptions` array and converts it to an array of objects
   * accepted by the ComboBox component.
   */
  function toComboboxOption(opt: Option) {
    return {
      name: opt.label || opt._id,
      value: opt._id,
      disabled: opt.disabled || opt._id === selectedOption?._id,
      errorMessage: opt.reason,
      identifier: isObjectId(opt._id)
        ? opt._id.slice(-7, opt._id.length)
        : typeof opt._id === 'number' && `${opt._id}`.length < 4
        ? `${opt._id}`
        : undefined,
    };
  }

  const { searchValue, options: referenceOptions, loading } = getReferenceOptions(referenceOpts);
  let referenceComboBoxWrapperElement: HTMLDivElement;
  let referenceComboBoxOpen = false;
  let referenceComboBoxValue = '';
</script>

{#if selectedOption && !showCurrentSelectionOnDropdown}
  <SelectedOption
    _id={selectedOption._id}
    label={selectedOption.label}
    {disabled}
    on:dismiss={() => {
      selectedOption = null;

      // also update the shared type value
      handleUpdateOption(selectedOption);
    }}
    openable={!!referenceOpts}
    on:open={() => {
      if (selectedOption?._id && referenceOpts) {
        handleOpenReference(selectedOption._id, referenceOpts);
      }
    }}
  />
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

        // otherwise, add it to the list
        selectedOption = {
          label: evt.detail.name,
          _id: evt.detail.value,
          disabled: evt.detail.disabled,
        };

        // also update the shared type value
        handleUpdateOption(selectedOption);

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

        // otherwise, add it to the list
        selectedOption = {
          label: evt.detail.name,
          _id: evt.detail.value,
          disabled: evt.detail.disabled,
        };

        // also update the shared type value
        handleUpdateOption(selectedOption);
      }}
    />
  {/key}
{/if}

<style>
  :global(.combobox-cristata) {
    width: 100%;
  }
</style>
