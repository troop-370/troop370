<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { isObjectId } from '$utils/isObjectId';
  import type { YStore } from '$utils/y/createYStore';
  import arrayDifferences from 'array-differences';
  import AwesomeDebouncePromise from 'awesome-debounce-promise';
  import { ComboBox, TextBox, TextBoxButton } from 'fluent-svelte';
  import { createEventDispatcher, tick } from 'svelte';
  import type * as Y from 'yjs';
  import type { Option, YDocOption } from '.';
  import SelectedOptions from './SelectedOptions.svelte';
  import { getReferenceOptions, type GetReferenceOptions } from './getReferenceOptions';
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

  /**
   * When true, when the component first connects the the ydoc,
   * it will overwrite the ydoc value with the initial selected options.
   */
  export let overwriteYDocValueWithInitialSelectedOptions = false;

  // this will be updated by a subsriber to ydoc, which is why this is not marked reactive
  let yarray = $ydoc?.getArray<YDocOption<string>>(ydocKey);

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
  $: if (referenceOpts) {
    const valuesAreMissingLabels = selectedOptions.some((opt) => !opt.label);
    const valuesAreMissingForcedFields = selectedOptions.some((opt) => {
      const optFields = Object.entries(opt)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key]) => key);
      const forcedFields = referenceOpts?.requiredFieldNames || [];
      return !forcedFields.every((field) => optFields.includes(field));
    });
    const noShadowItems = selectedOptions.every((opt) => opt.isDndShadowItem !== true);
    if (!populating && noShadowItems && (valuesAreMissingLabels || valuesAreMissingForcedFields)) {
      populate(selectedOptions, referenceOpts);
    }
  }

  const populate = AwesomeDebouncePromise(
    async (givenOptions: Option[], ref: GetReferenceOptions) => {
      populating = true;
      populateReferenceValues(
        givenOptions,
        ref.targetCollectionUid,
        ref.mainField,
        ref.requiredFieldNames,
        ref.token
      )
        .then((options) => {
          // console.log('new', { options, referenceOpts });
          handleDragFinalize(options);
        })
        .finally(() => {
          populating = false;
        });
    },
    500
  );

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

    // calculate the difference between the old options and the new options
    // so that a ydoc transaction can be created that only contains
    // the exact differences
    const diff = arrayDifferences(oldSelectedOptions, newOptions || selectedOptions);
    if (diff.length === 0) return;

    // expose changes to selected options via change event
    if (!newOptions.some((opt) => opt.isDndShadowItem)) {
      dispatch('change', newOptions);
    }

    // update the ydoc shared type value
    $ydoc?.transact(() => {
      diff.forEach(([diffType, index, maybeOption]) => {
        if (!yarray) return;

        if (diffType === 'deleted') {
          yarray.delete(index);
          return;
        }

        // maybeOption is only supposed to be undefined when diffType === 'deleted'
        if (!maybeOption) return;
        const { _id, ..._option } = maybeOption;
        const option: YDocOption<string> = {
          ..._option,
          label: _option.label || _id,
          value: _id,
        };

        if (diffType === 'inserted') {
          yarray.insert(index, [option]);
          return;
        }

        if (diffType === 'modified') {
          // remove from existing location
          yarray.delete(index);

          // add to new location
          yarray.insert(index, [option]);

          return;
        }
      });
    });

    // finally, update the old selected options
    oldSelectedOptions = newOptions || selectedOptions;
  }

  /**
   * Handle changes to y array shared type by updating the selected options and old selected options
   */
  function handleYArrayChange(evt: Y.YArrayEvent<YDocOption<string>>) {
    const yarray = $ydoc?.getArray<YDocOption<string>>(ydocKey);

    if (yarray && evt.changes.delta) {
      selectedOptions = yarray.toArray().map(convertToOption);
      oldSelectedOptions = yarray.toArray().map(convertToOption);
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

      // ensure the initial value and the shared type value match
      if (overwriteYDocValueWithInitialSelectedOptions) {
        $ydoc?.transact(() => {
          yarray?.delete(0, yarray.length);
          yarray?.insert(
            0,
            selectedOptions.map(({ _id, label, ...option }) => ({
              ...option,
              value: _id,
              label: label || _id,
            }))
          );
        });
      } else if (selectedOptions.length !== yarray.toArray().length) {
        selectedOptions = yarray.toArray().map(convertToOption);
        oldSelectedOptions = yarray.toArray().map(convertToOption);
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

      selectedOptions = [
        ...selectedOptions,
        ...newKeys.map((value) => ({ label: value, _id: value })),
      ];
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

      selectedOptions = [
        ...selectedOptions,
        ...newKeys.map((value) => ({ label: value, _id: value })),
      ];
    } else {
      selectedOptions = [...selectedOptions, { label: textValue, _id: textValue }];
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
      name: opt.label || opt._id,
      value: opt._id,
      disabled: opt.disabled,
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
        selectedOptions = [
          ...selectedOptions,
          { label: evt.detail.name, _id: evt.detail.value, disabled: evt.detail.disabled },
        ];

        // and update the shared type value
        handleDragFinalize(selectedOptions);

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
        selectedOptions = [
          ...selectedOptions,
          { label: evt.detail.name, _id: evt.detail.value, disabled: evt.detail.disabled },
        ];

        // and update the shared type value
        handleDragFinalize(selectedOptions);
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
