<script lang="ts">
  import { FieldWrapper, SchemaField } from '$lib/common/Field';
  import type { AwarenessUser, createYStore } from '$utils/y/createYStore';
  import { Button, ContentDialog, InfoBar, ProgressRing, TextBox } from 'fluent-svelte';
  import { writable, type Writable } from 'svelte/store';

  export let open = false;

  export let ystore: ReturnType<typeof createYStore>;
  export let disabled = false;
  export let user: AwarenessUser;
  export let session: Partial<SessionData>;
  export let fieldStyle = '';
  export let docData: Writable<Record<string, any>>;
  export let collectionUID: string;

  export let handleAction: (() => Promise<void>) | undefined = undefined;
  export let handleSumbit: ((publishedAt: string) => Promise<void>) | undefined = undefined;
  export let handleCancel: (() => Promise<void>) | undefined = undefined;

  let error: string;
  let hasChanged = false;
  let loadingSubmit = false;
  let loadingCancel = false;

  let thisDocData = writable({ publishedAt: '' });
  $: publishedAt = $thisDocData.publishedAt;
  $: if (!$thisDocData.publishedAt && $docData.publishedAt)
    $thisDocData.publishedAt = $docData.publishedAt;

  $: shortId = $docData?.object_id?.slice(-6) || ($docData ? parseInt($docData.id).toFixed(6) : '');

  let confirm = '';

  async function handleSave(publishedAt: string) {
    await handleAction?.();
    await handleSumbit?.(publishedAt);
    open = false;
    confirm = '';
    loadingSubmit = false;
  }
</script>

<ContentDialog
  title="Publish document"
  trapFocus={false}
  bind:open
  size="max"
  style="inline-size: 600px;"
>
  {#if error}
    <div class="error">
      <InfoBar severity="critical" title="Failed to save changes">{error}</InfoBar>
    </div>
  {/if}

  <InfoBar severity="caution" title="Check your work before you publish" closable={false}>
    Once you publish this document, it will be available for everyone to see. Only a few people will
    be able to unpublish this document.
  </InfoBar>

  <br />

  <SchemaField
    key="publishedAt"
    def={{
      type: 'datetime',
      field: {
        label: 'Choose publish date and time',
        description:
          'This data can be any time in the past or future. Content will not appear on public queries until the specified date has occured.',
      },
    }}
    {ystore}
    {disabled}
    yuser={user}
    mode="publish"
    {collectionUID}
    style={fieldStyle}
    docData={thisDocData}
    {session}
    deconstructedSchema={[]}
    actions={[]}
  />

  <FieldWrapper
    label="Confirm publish"
    description="Publish document <code>{shortId}</code>"
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
    <Button
      variant="accent"
      disabled={!publishedAt || confirm !== shortId}
      on:click={async () => {
        if (publishedAt) {
          await handleSave(publishedAt);
        }
      }}
    >
      {#if loadingSubmit}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        Publish
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
        confirm = '';
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
