<script lang="ts">
  import { FieldWrapper } from '$lib/common/Field';
  import type { Editor } from '@tiptap/core';
  import { Button, ContentDialog, ProgressRing, TextBox } from 'fluent-svelte';

  export let open = false;
  export let editor: Editor | null;
  export let title = 'Insert YouTube video';

  export let handleAction: (() => Promise<void>) | undefined = undefined;
  export let handleSumbit: ((videoId: string) => Promise<void>) | undefined = undefined;
  export let handleCancel: (() => Promise<void>) | undefined = undefined;

  let hasChanged = false;
  let loadingSubmit = false;
  let loadingCancel = false;

  let videoUrl = '';
  $: videoId = (() => {
    const regex =
      /(?:youtube(?:-nocookie)?\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi;
    return [...videoUrl.matchAll(regex)]?.[0]?.[1] || '';
  })();
</script>

<ContentDialog {title} bind:open size="standard">
  <FieldWrapper label="Video URL" forId="videoUrl">
    <TextBox type="text" bind:value={videoUrl} on:change={() => (hasChanged = true)} id="videoUrl" />
  </FieldWrapper>

  <svelte:fragment slot="footer">
    <Button
      variant="accent"
      disabled={!hasChanged || !videoId}
      on:click={async () => {
        loadingSubmit = true;
        await handleAction?.();
        await handleSumbit?.(videoId);
        open = false;
        videoUrl = '';
        loadingSubmit = false;
      }}
    >
      {#if loadingSubmit}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        Insert
      {/if}
    </Button>
    <Button
      on:click={async () => {
        if (hasChanged) {
          loadingCancel = true;
          await handleAction?.();
          await handleCancel?.();
          loadingCancel = false;
        }
        open = false;
        videoUrl = '';
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
