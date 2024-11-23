<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { title } from '$stores/title';
  import { hasKey, openWindow } from '$utils';
  import DeveloperDialog from './DeveloperDialog.svelte';
  import Editor from './Editor.svelte';
  import PublishDocumentDialog from './PublishDocumentDialog.svelte';
  import Sidebar from './Sidebar.svelte';

  export let data;
  $: ({ collectionConfig, docDataStore, saveStatus, actions: partialActions, versions } = data);
  $: ({ docData } = docDataStore);
  $: sidebarDocData = {
    ...$docData,
    status: data.isPublishedVersion ? 'published' : $docData.status,
  };

  let developerDialogOpen = false;
  let publishDocumentDialogOpen = false;

  $: if (browser) {
    title.set(`${$docDataStore[$collectionConfig.settings.mainField]} - ${$saveStatus}`);
  }

  $: actions = [
    ...$partialActions,
    {
      id: 'publish',
      label: 'Publish',
      action: () => {
        publishDocumentDialogOpen = true;
      },
      disabled: $saveStatus !== 'Unsaved changes' && $docData.status === 'published',
      icon: 'CloudArrowUp24Regular',
    },
    {
      id: 'clone',
      label: 'Clone document',
      icon: '',
      action: () => {
        goto(`/admin/cms/collection/${$collectionConfig.uid}/${$docData.documentId}/clone`);
      },
      onAuxClick: (evt) => {
        evt.preventDefault();
        if (hasKey(evt, 'button') && evt.button === 1) {
          openWindow(
            `/admin/cms/collection/${$collectionConfig.uid}/${$docData.documentId}/clone`,
            $docData.documentId + 'clone',
            'location=no'
          );
        }
      },
    },
    {
      id: 'developer',
      label: 'Open developer dialog',
      icon: '',
      action: () => {
        developerDialogOpen = !developerDialogOpen;
      },
    },
    {
      id: 'configure_view',
      label: 'Configure the view',
      icon: '',
      action: () => {
        goto(
          `/admin/content-manager/collection-types/${$collectionConfig.uid}/configurations/edit`
        );
      },
      onAuxClick: (evt) => {
        if (hasKey(evt, 'button') && evt.button === 1) {
          evt.preventDefault();
          openWindow(
            `/admin/content-manager/collection-types/${$collectionConfig.uid}/configurations/edit`,
            $docData.documentId + 'configure_view',
            'location=no'
          );
        }
      },
    },
    {
      id: 'legacy_editor',
      label: 'Open in legacy editor',
      icon: '',
      action: () => {
        goto(
          `/admin/content-manager/collection-types/${$collectionConfig.uid}/${$docData.documentId}`
        );
      },
      onAuxClick: (evt) => {
        if (hasKey(evt, 'button') && evt.button === 1) {
          evt.preventDefault();
          openWindow(
            `/admin/content-manager/collection-types/${$collectionConfig.uid}/${$docData.documentId}`,
            $docData.documentId + 'legacy_editor',
            'location=no'
          );
        }
      },
    },
  ] satisfies typeof $partialActions;

  let currentContentWidth = 1000;
  $: showSidebarInline = currentContentWidth <= 900;
  $: childWindow =
    (!!browser && !!window.name) || $page.url.searchParams.get('childWindow') === '1';
</script>

<DeveloperDialog bind:open={developerDialogOpen} {data} />
<PublishDocumentDialog
  bind:open={publishDocumentDialogOpen}
  documentId={`${$docData.documentId}`}
  handlePublish={async () => {
    return await data.publish();
  }}
/>

<div class="content-wrapper" bind:clientWidth={currentContentWidth}>
  <article style="padding: {showSidebarInline ? 20 : 40}px;">
    {#if showSidebarInline}
      <Sidebar
        isEmbedded
        docData={sidebarDocData}
        features={{ actions: !childWindow, docInfo: false, versions: false }}
      />
    {/if}

    <Editor
      data={{
        collectionConfig,
        docDataStore,
        session: data.session,
        save: data.save,
        publish: () => {
          publishDocumentDialogOpen = true;
        },
        defs: data.defs,
      }}
      disabled={data.isPublishedVersion}
    />

    {#if showSidebarInline}
      <Sidebar
        isEmbedded
        {actions}
        docData={sidebarDocData}
        features={{ actions: false, docInfo: true, versions: !childWindow }}
        previewConfig={data.previewConfig}
        versions={data.versions}
      />
    {/if}
  </article>

  {#if showSidebarInline === false}
    <Sidebar
      {actions}
      docData={sidebarDocData}
      features={{ actions: !childWindow, docInfo: true, versions: !childWindow }}
      previewConfig={data.previewConfig}
      versions={data.versions}
    />
  {/if}
</div>

<style>
  article {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    overflow: hidden auto;
  }

  .content-wrapper {
    display: flex;
    flex-direction: row;
    width: 100%;
    overflow: hidden;
    height: 100%;
    box-sizing: border-box;
  }
</style>
