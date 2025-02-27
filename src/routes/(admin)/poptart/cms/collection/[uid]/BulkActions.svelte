<script lang="ts">
  import { page } from '$app/stores';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  // import ArchiveSelectedDocs from '$lib/dialogs/ArchiveSelectedDocs.svelte';
  // import DeleteSelectedDocs from '$lib/dialogs/DeleteSelectedDocs.svelte';
  import { isModernCollection, strapiEditor } from '$stores/strapiEditor';
  import { openWindow } from '$utils/openWindow';
  import { Button } from 'fluent-svelte';
  import type { PageData } from './$types';
  import DeleteDocumentDialog from './[documentId]/DeleteDocumentDialog.svelte';
  import { deleteDocument } from './[documentId]/deleteDocument';
  import { filterSchemaDefs } from './[documentId]/filterSchemaDefs';
  import { selectedIds } from './selectedIdsStore';

  export let settings: NonNullable<PageData['collectionConfig']>;
  export let permissions: NonNullable<PageData['permissions']>;
  export let tableData: PageData['collectionDocsData'];
  export let session: PageData['session'];

  $: shouldOpenFullscreen =
    filterSchemaDefs($settings.defs, permissions, ['read', 'update']).filter(
      ([key, def]) =>
        def.type === 'text' &&
        def.customField === 'plugin::tiptap-editor.tiptap' &&
        !def.readonly &&
        !def.noread
    ).length === 1;

  $: show = $selectedIds.length > 0;

  $: links = {
    href:
      $strapiEditor || !isModernCollection($settings.uid)
        ? `/poptart/content-manager/collection-types/${$settings.uid}`
        : `/poptart/cms/collection/${$settings.uid}`,
    hrefSuffixKey: 'documentId',
    hrefSearch: shouldOpenFullscreen
      ? '?childWindow=1&fs=3&props=1&versions=2&comments=2'
      : '?childWindow=1',
    windowName: `editor-troop-370-${$settings.uid}-`,
  };

  $: firstSelectedHref = `${links.href}/${
    ($tableData?.data?.docs || []).find((doc) => doc.documentId === $selectedIds[0])?.[
      links.hrefSuffixKey
    ]
  }${links.hrefSearch || ''}`;

  let deleteDialogOpen = false;
  let archiveDialogOpen = false;
</script>

<div class="actions" class:show>
  <Button
    disabled={$selectedIds.length === 0}
    on:click={() => (deleteDialogOpen = !deleteDialogOpen)}
  >
    <FluentIcon name="Delete20Regular" mode="buttonIconLeft" />
    Delete
  </Button>

  <Button
    disabled={true || $selectedIds.length === 0}
    on:click={() => (archiveDialogOpen = !archiveDialogOpen)}
  >
    <FluentIcon name="Archive20Regular" mode="buttonIconLeft" />
    Archive
  </Button>

  <Button
    disabled={$selectedIds.length !== 1}
    on:click={() => {
      navigator.clipboard.writeText(`${$page.url.origin}${firstSelectedHref}`);
    }}
  >
    <FluentIcon name="Link20Regular" mode="buttonIconLeft" />
    Copy link
  </Button>
  <Button
    href={firstSelectedHref}
    disabled={$selectedIds.length !== 1}
    on:click={(evt) => {
      evt.preventDefault();
      openWindow(firstSelectedHref, links.windowName + $selectedIds[0], 'location=no');
    }}
  >
    <FluentIcon name="Open20Regular" mode="buttonIconLeft" />
    Open in Editor
  </Button>
</div>

<DeleteDocumentDialog
  bind:open={deleteDialogOpen}
  handleDelete={async () => {
    const result = await deleteDocument({
      collectionID: $settings.uid,
      documentIds: $selectedIds,
      session,
      fetch,
    });
    if (result.success) {
      await $tableData.refetch();
      $selectedIds = [];
      return true;
    }
    return result.failures?.toString() || 'Failed to delete selected documents';
  }}
  variant={$selectedIds > 1 ? 'multiple' : 'single'}
/>

<!-- <DeleteSelectedDocs
  bind:open={deleteDialogOpen}
  tenant={$page.params.tenant}
  byOne={collection.by.one}
  selectedIds={$selectedIds}
  schemaName={collection.name}
  handleSumbit={async () => {
    await $tableData.refetch();
  }}
/>

<ArchiveSelectedDocs
  bind:open={archiveDialogOpen}
  tenant={$page.params.tenant}
  byOne={collection.by.one}
  selectedIds={$selectedIds}
  schemaName={collection.name}
  handleSumbit={async () => {
    await $tableData.refetch();
  }}
/> -->

<style>
  div.actions {
    position: absolute;
    bottom: -60px;
    opacity: 0;
    transition: 240ms;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--fds-solid-background-quarternary);
    /* background-color: ${({ theme }) => Color(theme.color.neutral[theme.mode][300]).alpha(0.3).string()}; */
    backdrop-filter: blur(20px);
    border-radius: var(--fds-control-corner-radius);
    display: flex;
    flex-direction: row;
    box-shadow:
      0px 25.6px 57.6px rgb(0 0 0 / 14%),
      0px 0px 16.4px rgb(0 0 0 / 12%);
    z-index: 1;
    height: 40px;
  }

  div.actions.show {
    bottom: 0px;
    opacity: 1;
  }

  div.actions :global(.button) {
    border-radius: 0px;
    white-space: nowrap;
    box-shadow: none;
  }
  div.actions :global(.button:first-child) {
    border-top-left-radius: var(--fds-control-corner-radius);
    border-bottom-left-radius: var(--fds-control-corner-radius);
  }
  div.actions :global(.button:last-child) {
    border-top-right-radius: var(--fds-control-corner-radius);
    border-bottom-right-radius: var(--fds-control-corner-radius);
  }
</style>
