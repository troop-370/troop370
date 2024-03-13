<script lang="ts">
  import { FieldWrapper } from '$lib/common/Field';
  import { Button, ContentDialog, ProgressRing } from 'fluent-svelte';
  // import { SelectOne, type Option } from '$lib/common/Select';

  export let open = false;
  export let title = 'Insert photo';

  export let handleAction: (() => Promise<void>) | undefined = undefined;
  export let handleSumbit: ((_id: string) => Promise<void>) | undefined = undefined;
  export let handleCancel: (() => Promise<void>) | undefined = undefined;

  let hasChanged = false;
  let loadingSubmit = false;
  let loadingCancel = false;

  let selectedPhoto: Option | null = null;
</script>

<ContentDialog {title} bind:open size="standard" style="min-height: 480px;">
  <FieldWrapper
    label="Photo"
    forId="photoId"
    description="New photos can be uploaded via the photo library. Photos must have photo credit/attribution to be selectable."
  >
    <!-- <SelectOne
      reference={{
        collection: 'Photo',
        require: ['people.photo_created_by'],
      }}
      bind:selectedOption={selectedPhoto}
      on:change={() => (hasChanged = true)}
    /> -->
  </FieldWrapper>

  <svelte:fragment slot="footer">
    <Button
      variant="accent"
      disabled={!hasChanged || !selectedPhoto?._id}
      on:click={async () => {
        if (!selectedPhoto) return;
        loadingSubmit = true;
        await handleAction?.();
        await handleSumbit?.(selectedPhoto._id);
        open = false;
        selectedPhoto = null;
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
        selectedPhoto = null;
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
