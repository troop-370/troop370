<script lang="ts">
  import FieldWrapper from '$components/poptart/FieldWrapper.svelte';
  import { slugify } from '$utils';
  import {
    Button,
    ContentDialog,
    ProgressRing,
    RadioButton,
    TextBlock,
    TextBox,
  } from 'fluent-svelte';
  import type { z } from 'zod';
  import type { orderEntrySchema } from '../../ecwidSchemas';

  type Option = NonNullable<z.infer<typeof orderEntrySchema>['orderExtraFields']>[number];

  export let option: Option;
  export let disabled = false;
  export let handleSave: ((newValue: string) => Promise<true | Error>) | undefined = undefined;
  let dialogOpen = false;
  let errorMessage = '';
  let loading = false;

  $: id = slugify(option.id || '', '_');

  // set value to option value from parent component
  // whenever the parent component changes
  let value = option.value;
  function updateValueFromParent(newValue?: string) {
    if (newValue) value = newValue;
    else value = '';
  }
  $: updateValueFromParent(option.value);

  async function processSave() {
    loading = true;
    if (handleSave) {
      const status = await handleSave(value || '');
      if (status === true) dialogOpen = false;
      else errorMessage = status.message;
    } else {
      dialogOpen = false;
    }
    loading = false;
  }
</script>

<div>
  <TextBlock>{option.title || option.id}:</TextBlock>
  <TextBlock style="display: block; margin-left: 30px;">
    {option.value || '<no value>'}
    <Button variant="hyperlink" {disabled} on:click={() => (dialogOpen = !dialogOpen)}>Edit</Button>
  </TextBlock>
</div>

<ContentDialog
  bind:open={dialogOpen}
  title="Edit option"
  on:close={() => {
    updateValueFromParent(option.value);
  }}
>
  <FieldWrapper label={option.title || option.id || ''} forId={id}>
    <TextBox
      {id}
      bind:value
      on:keydown={(evt) => {
        if (evt.key === 'Enter' && !evt.ctrlKey && !evt.shiftKey && !evt.altKey && !evt.metaKey) {
          processSave();
        }
      }}
    />
  </FieldWrapper>

  <svelte:fragment slot="footer">
    <Button slot="footer" variant="accent" on:click={processSave} disabled={disabled || loading}>
      {#if loading}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        Save
      {/if}
    </Button>
    <Button slot="footer" on:click={() => (dialogOpen = false)} disabled={disabled || loading}
      >Do not save</Button
    >
  </svelte:fragment>
</ContentDialog>
