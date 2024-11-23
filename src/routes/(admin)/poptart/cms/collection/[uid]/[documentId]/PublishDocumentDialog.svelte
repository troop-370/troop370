<script lang="ts">
  import { browser } from '$app/environment';
  import FieldWrapper from '$components/poptart/FieldWrapper.svelte';
  import { Button, ContentDialog, InfoBar, ProgressRing, TextBlock, TextBox } from 'fluent-svelte';
  import { onDestroy, onMount } from 'svelte';
  import { publishDocument } from './publishDocument';

  export let open = false;
  export let handlePublish: (() => Promise<boolean | string>) | undefined = undefined;
  export let handleCancel: (() => Promise<void>) | undefined = undefined;
  export let handleAction: (() => Promise<void>) | undefined = undefined;
  export let documentId: string;
  export let disabled = false;

  $: shortId = documentId.slice(-6);
  let confirm = '';

  let loadingSubmit = false;
  let loadingCancel = false;

  let error = '';

  function keyboardShortcuts(evt: KeyboardEvent) {
    if (!open) return;

    // publish the document
    // CTRL + SHIFT + O
    if (evt.ctrlKey && evt.shiftKey && evt.key === '{') {
      confirm = shortId;
      publish();
      return;
    }
  }
  onMount(() => {
    document.addEventListener('keydown', keyboardShortcuts);
  });
  onDestroy(() => {
    if (browser) document.removeEventListener('keydown', keyboardShortcuts);
  });

  function handleClose() {
    open = false;
    confirm = '';
    error = '';
  }

  async function publish() {
    loadingSubmit = true;

    // reset the error message
    error = '';
    await new Promise((resolve) => setTimeout(resolve, 10));

    await handleAction?.();
    const response = await handlePublish?.();
    if (response === true) {
      handleClose();
    } else if (response) {
      error = response;
    }
    loadingSubmit = false;
  }
</script>

<ContentDialog title="Publish document" bind:open size="standard" on:close={handleClose}>
  {#if error}
    <div class="error">
      <InfoBar severity="critical" title="Failed to save changes">
        {#if error.startsWith('MISSING_FIELDS')}
          {@const missingFields = error.split(':')[1].split(',')}
          <TextBlock>
            The document is missing the following fields:
            <ul style="margin-top: 0;">
              {#each missingFields as field}
                <li>{field}</li>
              {/each}
            </ul>
            Please fill in the required fields and try again.
            <i>Required fields are marked with an asterisk (*).</i>
          </TextBlock>
        {:else}
          <TextBlock>{error}</TextBlock>
        {/if}
      </InfoBar>
    </div>
  {/if}

  <InfoBar
    severity="caution"
    title="Check your work before you publish"
    closable={false}
    style="margin-bottom: 20px;"
  >
    Once you publish this document, it will be available for everyone to see. Only a few people will
    be able to unpublish this document.
  </InfoBar>

  <FieldWrapper
    label="Confirm publish"
    description={`Publish document <code style="user-select: text; cursor: text;">${shortId}</code>`}
    forId={'____confirmPublish'}
  >
    <TextBox
      {disabled}
      placeholder={`Type "${shortId}" to publish the document`}
      bind:value={confirm}
    />
  </FieldWrapper>

  <InfoBar severity="information" title="Don't make a mistake" closable={false}>
    Before continuing, check the document and its metadata for formatting issues and typos
  </InfoBar>

  <svelte:fragment slot="footer">
    <Button variant="accent" disabled={confirm !== shortId} on:click={publish}>
      {#if loadingSubmit}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        Publish
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
        Cancel
      {/if}
    </Button>
  </svelte:fragment>
</ContentDialog>
