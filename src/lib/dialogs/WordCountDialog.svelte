<script lang="ts">
  import { FieldWrapper } from '$lib/common/Field';
  import { Button, ContentDialog, TextBlock } from 'fluent-svelte';

  export let open = false;
  export let wordCount = 0;
  export let charCount = 0;

  export let handleAction: (() => Promise<void>) | undefined = undefined;
</script>

<ContentDialog title="Document stats" bind:open size="min">
  <FieldWrapper label="Words" forId="words">
    <TextBlock variant="subtitle" tag="div">{wordCount}</TextBlock>
  </FieldWrapper>

  <FieldWrapper label="Characters" forId="characters">
    <TextBlock variant="subtitle" tag="div">{charCount}</TextBlock>
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
