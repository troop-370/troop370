<script lang="ts">
  import { Button, ContentDialog, InfoBar, ProgressRing, TextBlock } from 'fluent-svelte';

  export let open = false;
  export let handleDelete: (() => Promise<boolean | string>) | undefined = undefined;
  export let handleCancel: (() => Promise<void>) | undefined = undefined;
  export let handleAction: (() => Promise<void>) | undefined = undefined;
  export let disabled = false;
  export let variant: 'single' | 'multiple' = 'single';

  let loadingSubmit = false;
  let loadingCancel = false;

  let error = '';

  function handleClose() {
    open = false;
    error = '';
  }

  async function deleteDocument() {
    loadingSubmit = true;

    // reset the error message
    error = '';
    await new Promise((resolve) => setTimeout(resolve, 10));

    await handleAction?.();
    const response = await handleDelete?.();
    if (response === true) {
      handleClose();
    } else if (response) {
      error = response;
    }
    loadingSubmit = false;
  }
</script>

<ContentDialog
  title="Delete document{variant === 'multiple' ? 's' : ''}?"
  bind:open
  size="standard"
  on:close={handleClose}
>
  {#if error}
    <div class="error">
      <InfoBar severity="critical" title="Failed to delete">
        {#if error === 'Policy Failed'}
          <TextBlock>
            You do not have permission to delete this document. Please contact an administrator for
            assistance.
          </TextBlock>
        {:else}
          <TextBlock>{error}</TextBlock>
        {/if}
      </InfoBar>
    </div>
  {/if}

  <InfoBar severity="caution" closable={false}>
    Once you delete {variant === 'multiple' ? 'these' : 'this'} document{variant === 'multiple'
      ? 's'
      : ''}, it will be <b>impossible</b> to recover {variant === 'multiple' ? 'them' : 'it'}.
  </InfoBar>

  <svelte:fragment slot="footer">
    <Button variant="accent" {disabled} on:click={deleteDocument}>
      {#if loadingSubmit}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        Yes, delete
      {/if}
    </Button>
    <Button
      on:click={async () => {
        loadingCancel = true;
        await handleAction?.();
        await handleCancel?.();
        loadingCancel = false;
        handleClose();
      }}
    >
      {#if loadingCancel}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        No, cancel
      {/if}
    </Button>
  </svelte:fragment>
</ContentDialog>
