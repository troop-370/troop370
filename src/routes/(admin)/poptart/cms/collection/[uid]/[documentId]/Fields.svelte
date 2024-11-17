<script lang="ts">
  import { page } from '$app/stores';
  import Checkbox from '$components/poptart/Checkbox/Checkbox.svelte';
  import DateTime from '$components/poptart/DateTime/DateTime.svelte';
  import FieldWrapper from '$components/poptart/FieldWrapper.svelte';
  import { SelectMany, SelectOne } from '$components/poptart/Select';
  import StrapiUIDField from '$components/poptart/StrapiUIDField/StrapiUIDField.svelte';
  import TextArea from '$components/poptart/TextArea/TextArea.svelte';
  import { notEmpty, parseSchemaDefs } from '$utils';
  import { TextBox } from 'fluent-svelte';
  import { isArray, isBoolean, isNull, isNumber, isObject, isString, isUndefined } from 'is-what';
  import type { SchemaDef } from '../+layout';

  export let defs: SchemaDef[];
  export let docData: Record<string, unknown>;
  export let sessionAdminToken: string | undefined;
  export let variant: 'normal' | 'show-hidden' | 'hidden-only' = 'normal';

  // TODO: require this to always be specified
  export let collectionUID = $page.params.uid as string;
  export let relationCurrentDocumentId: string | number = docData.documentId as string;

  function isStringOrNull(value: unknown): value is string | null {
    return isString(value) || isNull(value);
  }

  $: ({ visibleFieldDefs, hiddenFieldDefs } = parseSchemaDefs(defs));
  $: defsToShow = variant === 'hidden-only' ? defs : visibleFieldDefs;
</script>

{#each defsToShow as [key, def]}
  {@const label = def.label ?? key}
  {@const description = def.description}

  {#if def.type === 'component'}
    <p>{label}</p>
    <section class="component component--{key}">
      <svelte:self
        defs={def.componentDefs?.map(([componentDefKey, def]) => [
          key + '.' + componentDefKey,
          def,
        ])}
        {docData}
        {sessionAdminToken}
        relationCurrentDocumentId={docData[key + '.id']}
        collectionUID={def.component}
        {variant}
      />
    </section>
  {:else if def.type === 'dynamiczone'}
    {@const zoneComponentDefs = Object.entries(def.componentDefs || {})}
    <p>{label}</p>
    <section class="dynamiczone dynamiczone--{key}">
      {#if isArray(docData[key])}
        {#each docData[key].filter(isObject) as item, index}
          {@const componentUID = item.__component}
          {@const component = zoneComponentDefs.find(([key]) => key === componentUID)}
          {@const componentSchemaDefs = component?.[1] || []}
          <section
            class="dynamiczone-component dynamiczone-item--{key} dynamiczone-component--{componentUID}"
          >
            <svelte:self
              defs={componentSchemaDefs}
              docData={item}
              {sessionAdminToken}
              relationCurrentDocumentId={item.id}
              collectionUID={componentUID}
              {variant}
            />
          </section>
        {/each}
      {/if}
    </section>
  {:else if def.type === 'boolean' && (isUndefined(docData[key]) || isBoolean(docData[key]))}
    <FieldWrapper {label} {description} forId={key} mode="checkbox">
      <Checkbox id={key} bind:checked={docData[key]} />
    </FieldWrapper>
  {:else}
    <FieldWrapper {label} {description} forId={key}>
      <!-- Strings -->
      {#if def.type === 'string' && isStringOrNull(docData[key])}
        <TextArea preventLines bind:value={docData[key]} id={key} />
        <!-- Text -->
      {:else if def.type === 'text' && isStringOrNull(docData[key])}
        <TextArea preventLines bind:value={docData[key]} id={key} />
        <!-- Email -->
      {:else if def.type === 'email' && isStringOrNull(docData[key])}
        <TextBox type="email" bind:value={docData[key]} id={key} />
        <!-- Password -->
      {:else if def.type === 'password' && isStringOrNull(docData[key])}
        <TextBox type="password" bind:value={docData[key]} id={key} />
        <!-- Blocks (RichText) -->
      {:else if def.type === 'blocks'}
        NOT SUPPORTED (blocks)
        <!-- UIDs -->
      {:else if def.type === 'uid'}
        <StrapiUIDField {key} {collectionUID} {docData} {sessionAdminToken} />
        <!-- Date -->
      {:else if def.type === 'date' && isStringOrNull(docData[key])}
        {@const [year, month, day] = docData[key]?.split('-')?.map(Number) || []}
        <DateTime
          hideTime={true}
          {year}
          {month}
          {day}
          on:change={(evt) => {
            docData[key] = evt.detail.split('T')[0];
          }}
        />
        <!-- DateTime -->
      {:else if def.type === 'datetime' && isStringOrNull(docData[key])}
        {@const date = docData[key] ? new Date(docData[key]) : null}
        {@const [year, month, day] = date
          ? [date.getFullYear(), date.getMonth() + 1, date.getDate()]
          : [undefined, undefined, undefined]}
        {@const time = (() => {
          if (!date) return undefined;
          var pad = function (num) {
              return (num < 10 ? '0' : '') + num;
            },
            padMs = function (num) {
              return (num < 10 ? '00' : num < 100 ? '0' : '') + num;
            };
          return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${padMs(date.getMilliseconds())}`;
        })()}
        <DateTime
          {year}
          {month}
          {day}
          {time}
          on:change={(evt) => {
            docData[key] = evt.detail;
          }}
        />
        <!-- Relations -->
      {:else if def.type === 'relation' && def.target && def.mainField && isString(docData.documentId)}
        <!-- one-to-one -->
        {#if def.relation === 'oneToOne'}
          <SelectOne
            referenceOpts={{
              collectionUid: collectionUID,
              targetCollectionUid: def.target,
              fieldId: key.split('.').slice(-1)[0],
              currentDocumentId: `${relationCurrentDocumentId}`,
              token: sessionAdminToken,
              mainField: def.mainField,
              idsToInclude: isArray(docData[key])
                ? docData[key]
                    ?.filter(notEmpty)
                    .filter((opt) => isObject(opt))
                    .map((opt) => opt.id)
                    .filter((id) => isNumber(id))
                : [],
              searchImmediately: true,
            }}
            selectedOption={(() => {
              if (!isArray(docData[key])) return null;
              if (!isObject(docData[key][0])) return null;
              return {
                _id: `${docData[key][0].documentId}`,
                ...docData[key][0],
                label: docData[key][0][def.mainField]?.toString(),
              };
            })()}
            on:change={(evt) => {
              if (evt.detail === null) {
                docData[key] = [];
              } else {
                docData[key] = [evt.detail];
              }
            }}
          />
          <!-- one-to-many -->
        {:else if def.relation === 'oneToMany'}
          <SelectMany
            referenceOpts={{
              collectionUid: collectionUID,
              targetCollectionUid: def.target,
              fieldId: key.split('.').slice(-1)[0],
              currentDocumentId: `${relationCurrentDocumentId}`,
              token: sessionAdminToken,
              mainField: def.mainField,
              pageSize: 100,
              idsToInclude: isArray(docData[key])
                ? docData[key]
                    ?.filter(notEmpty)
                    .filter((opt) => isObject(opt))
                    .map((opt) => opt.id)
                    .filter((id) => isNumber(id))
                : [],
              searchImmediately: true,
            }}
            selectedOptions={(() => {
              if (!isArray(docData[key])) return undefined;

              return docData[key]
                .filter((opt) => isObject(opt))
                .map((opt) => {
                  if (!def.mainField) return null;
                  return {
                    _id: `${opt.documentId}`,
                    ...opt,
                    label: opt[def.mainField]?.toString(),
                  };
                })
                .filter(notEmpty);
            })()}
            on:change={(evt) => {
              docData[key] = evt.detail;
            }}
          />
        {:else}
          <p>Error: The reference field could not be loaded.</p>
          <pre>{JSON.stringify(docData[key], null, 2)}</pre>
        {/if}
        <!-- Unknown -->
      {:else if def.type === 'enumeration'}
        <SelectOne
          options={def.enum.map((value) => ({ _id: value, label: value }))}
          selectedOption={(() => {
            if (!isString(docData[key])) return null;
            return {
              _id: `${docData[key]}`,
              label: `${docData[key]}`,
            };
          })()}
          on:change={(evt) => {
            docData[key] = evt.detail?.label;
          }}
          showCurrentSelectionOnDropdown
          hideSelected={false}
        />
      {:else}
        <pre>{JSON.stringify(def, null, 2)}</pre>
        {docData[key]}
      {/if}
    </FieldWrapper>
  {/if}
{/each}

{#if variant === 'show-hidden' && hiddenFieldDefs.length > 0}
  <hr />
  <h1>Hidden fields</h1>
  <svelte:self {...$$props} defs={hiddenFieldDefs} variant="hidden-only" />
{/if}

<style>
  section.component {
    border: 1px solid #ccc;
    border-radius: 4px;
    margin: 20px 0;
    padding: 20px;
  }

  section.dynamiczone {
    border: 1px solid blue;
    border-radius: 4px;
    margin: 20px 0;
    padding: 20px;
  }

  section.dynamiczone-component {
    border: 1px solid red;
    border-radius: 4px;
    margin: 20px 0;
    padding: 20px;
  }
</style>
