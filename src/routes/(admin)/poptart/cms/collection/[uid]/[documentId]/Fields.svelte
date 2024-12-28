<script lang="ts">
  import { browser } from '$app/environment';
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import Checkbox from '$components/poptart/Checkbox/Checkbox.svelte';
  import Code from '$components/poptart/Code/Code.svelte';
  import DateTime from '$components/poptart/DateTime/DateTime.svelte';
  import Components from '$components/poptart/DocArray/Components.svelte';
  import FieldWrapper from '$components/poptart/FieldWrapper.svelte';
  import { SelectMany, SelectOne } from '$components/poptart/Select';
  import StrapiUIDField from '$components/poptart/StrapiUIDField/StrapiUIDField.svelte';
  import TextArea from '$components/poptart/TextArea/TextArea.svelte';
  import { RichTiptap, type AwarenessUser } from '$components/poptart/Tiptap';
  import { editorExtensions } from '$components/poptart/Tiptap/editorExtensions';
  import { richTextParams } from '$components/poptart/Tiptap/richTextParams';
  import { hasKey, notEmpty, parseSchemaDefs } from '$utils';
  import { blocksToProsemirror } from '$utils/blocksToProsemirror';
  import { isJSON } from '$utils/isJSON';
  import { listExtraFieldNames } from '$utils/listRequiredFieldNames';
  import { setTipTapXMLFragment } from '$utils/setTipTapXMLFragment';
  import { InfoBar, TextBlock, TextBox } from 'fluent-svelte';
  import {
    isArray,
    isBoolean,
    isNull,
    isNullOrUndefined,
    isNumber,
    isObject,
    isString,
    isUndefined,
  } from 'is-what';
  import { type ComponentProps } from 'svelte';
  import { get, readable } from 'svelte/store';
  import * as Y from 'yjs';
  import type { SchemaDef } from '../+layout';
  import type { PageData } from './$types';
  import { _isDocDataStore, type Action, type DocDataStore } from './+page';
  import type Sidebar from './Sidebar.svelte';

  export let defs: SchemaDef[];
  export let docData: DocDataStore;
  $: ({ docData: plainDocData } = docData);
  export let sessionAdminToken: string | undefined;
  export let variant: 'normal' | 'show-hidden' | 'hidden-only' = 'normal';
  export let parentKeyPathLabel = '';
  let allDisabled = false;
  export { allDisabled as disabled };
  export let coreSidebarProps: ComponentProps<Sidebar> | undefined = undefined;
  export let isEmbedded = false;
  export let user: AwarenessUser;
  export let collectionConfig: PageData['collectionConfig'];

  // TODO: require this to always be specified
  export let relationCurrentDocumentId: string | number = $docData.documentId as string;
  export let collectionUID = $page.params.uid as string;

  export let actions: Action[] = [];

  function isStringOrNullish(value: unknown): value is string | null {
    return isString(value) || isNullOrUndefined(value);
  }

  $: ({ visibleFieldDefs, hiddenFieldDefs } = parseSchemaDefs(defs));
  $: defsToShow = variant === 'hidden-only' ? defs : visibleFieldDefs;

  // ensure that the ydoc contains tiptap fields
  const ydoc = readable(new Y.Doc());
  $: tiptapFields = defs.filter(([key, def]) => def.customField === 'plugin::tiptap-editor.tiptap');
  $: legacyBlocksFields = defs.filter(([key, def]) => def.type === 'blocks');
  let hasSetTipTapFields = false;
  $: if (!hasSetTipTapFields) {
    tiptapFields.forEach(([key, def], index) => {
      setTipTapXMLFragment(
        key,
        $docData[key] as string | null | undefined,
        $ydoc,
        editorExtensions.tiptap
      );
      if (index === tiptapFields.length - 1) {
        hasSetTipTapFields = true;
      }
    });
    legacyBlocksFields.forEach(([key, def], index) => {
      try {
        setTipTapXMLFragment(
          key,
          JSON.stringify(blocksToProsemirror($docData[key] as any)),
          $ydoc,
          editorExtensions.tiptap
        );
      } catch {}
    });
  }

  // track fullscreen editor status
  let fullscreen =
    $richTextParams.isActive('fs') ||
    $page.url.searchParams.get('fs') === '1' ||
    $page.url.searchParams.get('fs') === '3' ||
    $page.url.searchParams.get('fs') === 'force';
  $: if (browser) {
    fullscreen = $richTextParams.isActive('fs') || $page.url.searchParams.get('fs') === 'force';
  }
  afterNavigate(() => {
    fullscreen = $richTextParams.isActive('fs') || $page.url.searchParams.get('fs') === 'force';
  });
</script>

{#each defsToShow.filter(([key, def]) => {
  if (def.customField === 'plugin::tiptap-editor.tiptap') {
    return !isEmbedded;
  }
  return true;
}) as [key, def]}
  {@const label = (() => {
    let label = def.label ?? key;
    if (def.required && def.type !== 'boolean') label += '*';
    return label;
  })()}
  {@const description = def.description}
  {@const forId = (parentKeyPathLabel || '') + key}
  {@const disabled = allDisabled || def.readonly || def.noread}

  {#if !fullscreen || isEmbedded || def.customField === 'plugin::tiptap-editor.tiptap'}
    <FieldWrapper
      {label}
      {description}
      {forId}
      mode={def.type === 'boolean' ? 'checkbox' : 'default'}
    >
      {#if def.readonly}
        <div style="margin-bottom: 6px;">
          <InfoBar severity="information" closable={false} class="inline-infobar">
            You do not have permission to edit this field.
          </InfoBar>
        </div>
      {/if}
      {#if def.noread}
        <InfoBar severity="information" closable={false} class="inline-infobar">
          You do not have permission to view this field.
        </InfoBar>
      {:else if def.customField}
        {#if def.customField === 'plugin::tiptap-editor.tiptap'}
          {@const tiptapOptions = isObject(def.options) ? def.options : {}}
          <RichTiptap
            {disabled}
            options={{
              ...tiptapOptions,
              metaFrame: $collectionConfig.inlinePreviewHref,
              features: {
                ...(tiptapOptions.features || {}),
                fontSizes:
                  hasKey(tiptapOptions.features, 'fontSizes') &&
                  isString(tiptapOptions.features.fontSizes) &&
                  isJSON(tiptapOptions.features.fontSizes)
                    ? JSON.parse(tiptapOptions.features.fontSizes)
                    : [],
                fontFamilies:
                  hasKey(tiptapOptions.features, 'fontFamilies') &&
                  isString(tiptapOptions.features.fontFamilies) &&
                  isJSON(tiptapOptions.features.fontFamilies)
                    ? JSON.parse(tiptapOptions.features.fontFamilies)
                    : [],
              },
            }}
            dynamicPreviewHref={$collectionConfig.dynamicPreviewHref}
            actions={actions || []}
            {user}
            ydocKey={key}
            fullSharedData={docData}
            {ydoc}
            {coreSidebarProps}
            {fullscreen}
            docPropertiesSidebarProps={{
              defs,
              docDataStore: docData,
              sessionAdminToken,
              variant,
            }}
            on:transaction={(evt) => {
              if (evt.detail) {
                const content = evt.detail.content;
                $docData[key] = JSON.stringify(content);
              }
            }}
          />
        {:else}
          <p>Unsupported custom field</p>
          <pre>{JSON.stringify(def, null, 2)}</pre>
          {$docData[key]}
        {/if}
      {:else if def.type === 'component' && isArray(def.componentDefs) && (_isDocDataStore($docData[key]) || isNull($docData[key]))}
        {#if isObject($plainDocData[key]) || isNull($docData[key])}
          {@const id = isObject($plainDocData[key]) ? `${$plainDocData[key].id}` : null}
          {@const isEmpty = Object.keys($plainDocData[key] || {}).length === 0}
          <Components
            {disabled}
            componentUIDs={[def.component]}
            arr={isNull(id) || isNull($docData[key])
              ? []
              : isEmpty
                ? []
                : [
                    {
                      __uuid: id,
                      _id: id,
                      __docData: $docData[key],
                      __componentUID: def.component,
                    },
                  ]}
            fieldsComponentProps={{
              defs: [{ componentUID: def.component, defs: def.componentDefs }],
              sessionAdminToken,
              variant,
              parentKeyPathLabel: forId ? forId + '.NOTARRAY' : '',
            }}
            maxLength={1}
            on:dismiss={(evt) => {
              $docData[key] = null;
            }}
            on:add={(evt) => {
              if (isNull($docData[key])) {
                $docData[key] = { id: evt.detail[0]._id };
              }
            }}
          />
        {:else}
          UNSUPPORTED: Array of components
        {/if}
      {:else if def.type === 'dynamiczone'}
        {@const zoneComponentDefs = Object.entries(def.componentDefs || {})}
        {#if isArray($docData[key]) && isArray($plainDocData[key])}
          {@const docDatas = $docData[key].filter(_isDocDataStore)}
          {@const componentUIDs = $plainDocData[key]
            .filter(isObject)
            .map((entry) => entry.__component)
            .filter(isString)}

          <Components
            {disabled}
            componentUIDs={def.components}
            componentSettings={def.componentSettings}
            arr={docDatas
              .map((docData, index) => {
                const id = get(docData).id;
                if (isString(id) || isNumber(id)) {
                  return {
                    __uuid: id.toString(),
                    _id: id.toString(),
                    __docData: docData,
                    __componentUID: componentUIDs[index],
                  };
                }
              })
              .filter(notEmpty)}
            fieldsComponentProps={{
              defs: zoneComponentDefs.map(([componentUID, defs]) => ({ componentUID, defs })),
              sessionAdminToken,
              variant,
              parentKeyPathLabel: forId ? forId + '.' : '',
            }}
            on:dismiss={(evt) => {
              $docData[key] = evt.detail.map((item) => item.__docData);
            }}
            on:add={(evt) => {
              if (!isArray($docData[key])) return;

              // transform the new items that do not have docData
              const newItems = evt.detail
                .filter((item) => !isObject(item.__docData))
                .map((item) => {
                  return {
                    id: item._id,
                    __component: item.__componentUID,
                  };
                });

              $docData[key] = [...($docData[key] || []), ...newItems];
            }}
            on:dragfinalize={(evt) => {
              $docData[key] = evt.detail.map((item) => item.__docData);
            }}
          />
        {/if}
      {:else if def.type === 'boolean' && (isUndefined($docData[key]) || isBoolean($docData[key]))}
        <Checkbox id={forId} bind:checked={$docData[key]} {disabled} />
      {:else}
        <!-- Strings -->
        {#if def.type === 'string' && isStringOrNullish($docData[key])}
          <TextArea preventLines bind:value={$docData[key]} id={forId} {disabled} />
          <!-- Text -->
        {:else if def.type === 'text' && isStringOrNullish($docData[key])}
          <TextArea preventLines bind:value={$docData[key]} id={forId} {disabled} />
          <!-- Email -->
        {:else if def.type === 'email' && isStringOrNullish($docData[key])}
          <TextBox type="email" bind:value={$docData[key]} id={forId} {disabled} />
          <!-- Password -->
        {:else if def.type === 'password' && isStringOrNullish($docData[key])}
          <TextBox type="password" bind:value={$docData[key]} id={forId} {disabled} />
          <!-- Markdown -->
        {:else if def.type === 'richtext' && isStringOrNullish($docData[key])}
          <Code type="md" key={forId} bind:value={$docData[key]} {disabled} />
          <!-- Blocks -->
        {:else if def.type === 'blocks'}
          <div style="margin-bottom: 6px;">
            <InfoBar severity="caution" closable={false} class="inline-infobar">
              This is a legacy field type. It cannot be edited with the new editor.
            </InfoBar>
          </div>
          <RichTiptap disabled hiddenUI {user} ydocKey={key} fullSharedData={docData} {ydoc} />
          <!-- UIDs -->
        {:else if def.type === 'uid'}
          <StrapiUIDField {key} {collectionUID} {docData} {sessionAdminToken} {disabled} />
          <!-- Date -->
        {:else if def.type === 'date' && isStringOrNullish($docData[key])}
          {@const [year, month, day] = $docData[key]?.split('-')?.map(Number) || []}
          <DateTime
            hideTime={true}
            {year}
            {month}
            {day}
            {disabled}
            on:change={(evt) => {
              $docData[key] = evt.detail.split('T')[0];
            }}
          />
          <!-- DateTime -->
        {:else if def.type === 'datetime' && isStringOrNullish($docData[key])}
          {@const date = $docData[key] ? new Date($docData[key]) : null}
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
            {disabled}
            on:change={(evt) => {
              $docData[key] = evt.detail;
            }}
          />
          <!-- Relations -->
        {:else if def.type === 'relation' && def.target && def.mainField}
          <!-- one-to-one -->
          {#if def.relation === 'oneToOne'}
            <SelectOne
              {disabled}
              referenceOpts={{
                collectionUid: collectionUID,
                targetCollectionUid: def.target,
                fieldId: key.split('.').slice(-1)[0],
                currentDocumentId: relationCurrentDocumentId?.toString(),
                token: sessionAdminToken,
                mainField: def.mainField,
                idsToInclude: isArray($docData[key])
                  ? $docData[key]
                      ?.filter(notEmpty)
                      .filter((opt) => isObject(opt))
                      .map((opt) => opt.id)
                      .filter((id) => isNumber(id))
                  : [],
                searchImmediately: true,
              }}
              selectedOption={(() => {
                if (!isArray($docData[key])) return null;
                if (!isObject($docData[key][0])) return null;
                return {
                  _id: `${$docData[key][0].documentId}`,
                  ...$docData[key][0],
                  label: $docData[key][0][def.mainField]?.toString() || '',
                };
              })()}
              on:change={(evt) => {
                if (evt.detail === null) {
                  $docData[key] = [];
                } else {
                  $docData[key] = [evt.detail];
                }
              }}
            />
            <!-- one-to-many -->
          {:else if def.relation === 'oneToMany'}
            {@const fieldId = key.split('.').slice(-1)[0]}
            <SelectMany
              {disabled}
              referenceOpts={{
                collectionUid: collectionUID,
                targetCollectionUid: def.target,
                fieldId,
                currentDocumentId: relationCurrentDocumentId?.toString() || '',
                token: sessionAdminToken,
                mainField: def.mainField,
                pageSize: 100,
                idsToInclude: isArray($docData[key])
                  ? $docData[key]
                      ?.filter(notEmpty)
                      .filter((opt) => isObject(opt))
                      .map((opt) => opt.id)
                      .filter((id) => isNumber(id))
                  : [],
                searchImmediately: true,
                forceLoadFields: listExtraFieldNames(collectionUID, fieldId),
              }}
              selectedOptions={(() => {
                if (!isArray($docData[key])) return undefined;

                return $docData[key]
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
                $docData[key] = evt.detail;
              }}
            />
          {:else}
            <p>Error: The reference field could not be loaded.</p>
            <pre>{JSON.stringify($docData[key], null, 2)}</pre>
          {/if}
          <!-- Unknown -->
        {:else if def.type === 'enumeration'}
          <SelectOne
            {disabled}
            options={def.enum.map((value) => ({ _id: value, label: value }))}
            selectedOption={(() => {
              if (!isString($docData[key])) return null;
              return {
                _id: `${$docData[key]}`,
                label: `${$docData[key]}`,
              };
            })()}
            on:change={(evt) => {
              $docData[key] = evt.detail?.label;
            }}
            showCurrentSelectionOnDropdown
            hideSelected={false}
          />
        {:else}
          <pre>{JSON.stringify(def, null, 2)}</pre>
          {$docData[key]}
        {/if}
      {/if}
    </FieldWrapper>
  {/if}
{/each}

{#if variant === 'show-hidden' && hiddenFieldDefs.length > 0}
  <section class="hidden">
    <TextBlock variant="subtitle">Hidden fields</TextBlock>
    <br />
    <br />
    <svelte:self {...$$props} defs={hiddenFieldDefs} variant="hidden-only" />
  </section>
{/if}

<style>
  section.hidden {
    background-color: var(--fds-card-background-default);
    box-shadow: inset 0 0 0 1px var(--fds-control-stroke-default);
    border-radius: var(--fds-control-corner-radius);
    padding: 1rem;
    margin: 1rem 0;
  }

  :global(.inline-infobar) {
    min-block-size: 30px !important;
    padding-inline-start: 12px !important;
  }
  :global(.inline-infobar p) {
    font-size: 12px !important;
  }
  :global(.inline-infobar .info-bar-icon) {
    margin-block-start: 10px !important;
  }
  :global(.inline-infobar .info-badge) {
    min-block-size: 14px !important;
    min-inline-size: 14px !important;
    border-radius: 14px !important;
    padding: 3px !important;
  }
  :global(.inline-infobar .info-bar-content) {
    margin-inline-start: 10px !important;
  }
</style>
