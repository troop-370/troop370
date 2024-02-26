<script lang="ts">
  import FieldWrapper from '$components/admin/FieldWrapper.svelte';
  import { slugify } from '$utils';
  import { Button, ContentDialog, RadioButton, TextBlock, TextBox } from 'fluent-svelte';
  import type { z } from 'zod';
  import type { orderEntrySchema } from '../../ecwidSchemas';

  type Item = NonNullable<z.infer<typeof orderEntrySchema>['items']>[number];
  type Option = NonNullable<Item['selectedOptions']>[number];

  export let option: Option;
  export let disabled = false;
  export let handleSave: ((newValue: string) => Promise<true | Error>) | undefined = undefined;
  let dialogOpen = false;
  let errorMessage = '';

  $: id = slugify(option.name || '', '_');

  // set value to option value from parent component
  // whenever the parent component changes
  let value = option.value;
  function updateValueFromParent(newValue?: string) {
    if (newValue) value = newValue;
    else value = '';
  }
  $: updateValueFromParent(option.value);

  async function processSave() {
    if (handleSave) {
      const status = await handleSave(value || '');
      if (status === true) dialogOpen = false;
      else errorMessage = status.message;
    } else {
      dialogOpen = false;
    }
  }
</script>

<div>
  <TextBlock>{option.name}:</TextBlock>
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
  <FieldWrapper label={option.name || ''} forId={id}>
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
    <Button slot="footer" variant="accent" on:click={processSave}>Save</Button>
    <Button slot="footer" on:click={() => (dialogOpen = false)}>Do not save</Button>
  </svelte:fragment>
</ContentDialog>
