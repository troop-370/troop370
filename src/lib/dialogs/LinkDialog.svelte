<script lang="ts">
  import { FieldWrapper } from '$lib/common/Field';
  import type { Editor } from '@tiptap/core';
  import { Button, ContentDialog, ProgressRing, TextBox } from 'fluent-svelte';

  export let open = false;
  export let editor: Editor | null;
  export let title = 'Insert link';

  export let handleAction: (() => Promise<void>) | undefined = undefined;
  export let handleSumbit: ((videoId: string) => Promise<void>) | undefined = undefined;
  export let handleCancel: (() => Promise<void>) | undefined = undefined;

  let loadingSubmit = false;
  let loadingCancel = false;

  let link = '';
  $: if (!open) link = editor?.getAttributes('link').href || '';
</script>

<ContentDialog {title} bind:open size="standard">
  <FieldWrapper label="Link" forId="link">
    <TextBox type="text" bind:value={link} id="link" />
  </FieldWrapper>

  <svelte:fragment slot="footer">
    <Button
      variant="accent"
      disabled={!link}
      on:click={async () => {
        loadingSubmit = true;
        await handleAction?.();
        await handleSumbit?.(link);
        open = false;
        link = '';
        loadingSubmit = false;
      }}
    >
      {#if loadingSubmit}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else if editor?.getAttributes('link').href}
        Update link
      {:else}
        Insert link
      {/if}
    </Button>
    <Button
      disabled={!editor?.getAttributes('link').href}
      on:click={async () => {
        loadingSubmit = true;
        await handleAction?.();
        await handleSumbit?.('');
        open = false;
        link = '';
        loadingSubmit = false;
      }}
    >
      {#if loadingSubmit}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        Remove link
      {/if}
    </Button>
    <Button
      on:click={async () => {
        loadingCancel = true;
        await handleAction?.();
        await handleCancel?.();
        loadingCancel = false;
        open = false;
        link = '';
      }}
    >
      {#if loadingCancel}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        Cancel
      {/if}
    </Button>
  </svelte:fragment>
</ContentDialog>
