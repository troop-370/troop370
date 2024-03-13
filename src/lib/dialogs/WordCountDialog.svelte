<script lang="ts">
  import { FieldWrapper } from '$lib/common/Field';
  import type { Editor } from '@tiptap/core';
  import { Button, ContentDialog, TextBlock } from 'fluent-svelte';

  export let open = false;
  export let editor: Editor | null;

  export let handleAction: (() => Promise<void>) | undefined = undefined;
</script>

<ContentDialog title="Document stats" bind:open size="min">
  <FieldWrapper label="Words" forId="words">
    <TextBlock variant="subtitle" tag="div">{editor?.storage.characterCount.words()}</TextBlock>
  </FieldWrapper>

  <FieldWrapper label="Characters" forId="characters">
    <TextBlock variant="subtitle" tag="div">{editor?.storage.characterCount.characters()}</TextBlock>
  </FieldWrapper>

  <svelte:fragment slot="footer">
    <Button
      variant="accent"
      on:click={async () => {
        await handleAction?.();
        open = false;
      }}
    >
      Close
    </Button>
  </svelte:fragment>
</ContentDialog>
