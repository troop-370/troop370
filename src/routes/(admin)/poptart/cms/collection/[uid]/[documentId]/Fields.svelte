<script lang="ts">
  import { page } from '$app/stores';
  import Checkbox from '$components/poptart/Checkbox/Checkbox.svelte';
  import DateTime from '$components/poptart/DateTime/DateTime.svelte';
  import FieldWrapper from '$components/poptart/FieldWrapper.svelte';
  import StrapiUIDField from '$components/poptart/StrapiUIDField/StrapiUIDField.svelte';
  import TextArea from '$components/poptart/TextArea/TextArea.svelte';
  import { TextBox } from 'fluent-svelte';
  import { isBoolean, isString, isUndefined } from 'is-what';
  import type { SchemaDef } from '../+layout';

  export let defs: SchemaDef[];
  export let docData: Record<string, unknown>;
  export let sessionAdminToken: string | undefined;
</script>

{#each defs as [key, def]}
  {@const label = def.label ?? key}

  {#if def.type === 'component'}
    <p>{label}</p>
    <section class="component component--{key}">
      <svelte:self defs={def.componentDefs} {docData} />
    </section>
  {:else if def.type === 'dynamiczone'}
    {@const zoneComponentDefs = Object.entries(def.componentDefs || {})}
    <p>{label}</p>
    <section class="dynamiczone dynamiczone--{key}">
      {#each zoneComponentDefs as [componentUID, defs]}
        <p>{componentUID}</p>
        <section class="dynamiczone-component dynamiczone-component--{componentUID}">
          <svelte:self {defs} {docData} />
        </section>
      {/each}
    </section>
  {:else if def.type === 'boolean' && (isUndefined(docData[key]) || isBoolean(docData[key]))}
    <FieldWrapper {label} forId={key} mode="checkbox">
      <Checkbox id={key} bind:checked={docData[key]} />
    </FieldWrapper>
  {:else}
    <FieldWrapper {label} forId={key}>
      <!-- Strings -->
      {#if def.type === 'string' && isString(docData[key])}
        <TextArea preventLines bind:value={docData[key]} id={key} />
        <!-- Text -->
      {:else if def.type === 'text' && isString(docData[key])}
        <TextArea preventLines bind:value={docData[key]} id={key} />
        <!-- Email -->
      {:else if def.type === 'email' && isString(docData[key])}
        <TextBox type="email" bind:value={docData[key]} id={key} />
        <!-- Password -->
      {:else if def.type === 'password' && isString(docData[key])}
        <TextBox type="password" bind:value={docData[key]} id={key} />
        <!-- Blocks (RichText) -->
      {:else if def.type === 'blocks'}
        NOT SUPPORTED (blocks)
        <!-- UIDs -->
      {:else if def.type === 'uid'}
        <!-- TODO: verify if this is a valid input for collectionUID if a UID field is in a component -->
        <StrapiUIDField {key} collectionUID={$page.params.uid} {docData} {sessionAdminToken} />
        <!-- Date -->
      {:else if def.type === 'date' && isString(docData[key])}
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
      {:else if def.type === 'datetime' && isString(docData[key])}
        {@const date = new Date(docData[key])}
        {@const [year, month, day] = [date.getFullYear(), date.getMonth() + 1, date.getDate()]}
        {@const time = (() => {
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
        <!-- Unknown -->
      {:else}
        <pre>{JSON.stringify(def, null, 2)}</pre>
        {docData[key]}
      {/if}
    </FieldWrapper>
  {/if}
{/each}

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
