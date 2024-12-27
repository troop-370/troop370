<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { title } from '$stores/title';
  import { genAvatar, hasKey, notEmpty, openWindow } from '$utils';
  import _ColorHash from 'color-hash';
  import type { ComponentProps } from 'svelte';
  import DeveloperDialog from './DeveloperDialog.svelte';
  import Editor from './Editor.svelte';
  import PublishDocumentDialog from './PublishDocumentDialog.svelte';
  import Sidebar from './Sidebar.svelte';

  // @ts-expect-error https://github.com/zenozeng/color-hash/issues/42
  const ColorHash: typeof _ColorHash = _ColorHash.default || _ColorHash;
  // @ts-expect-error 'bkdr' is a vlid hash config value
  const colorHash = new ColorHash({ saturation: 0.8, lightness: 0.34, hash: 'bkdr' });

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
    $collectionConfig.options?.draftAndPublish !== false
      ? {
          id: 'publish',
          label: 'Publish',
          action: () => {
            publishDocumentDialogOpen = true;
          },
          disabled: $saveStatus !== 'Unsaved changes' && $docData.status === 'published',
          icon: 'CloudArrowUp24Regular',
        }
      : null,
    {
      id: 'clone',
      label: 'Clone document',
      icon: 'DocumentCopy16Regular',
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
      icon: 'DeveloperBoard16Regular',
      action: () => {
        developerDialogOpen = !developerDialogOpen;
      },
    },
    {
      id: 'configure_view',
      label: 'Configure the view',
      icon: 'Options16Regular',
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
      label: 'Switch to legacy editor',
      icon: 'CircleEdit24Regular',
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
  ].filter(notEmpty) satisfies typeof $partialActions;

  let currentContentWidth = 1000;
  $: showSidebarInline = currentContentWidth <= 900;
  $: childWindow =
    (!!browser && !!window.name) || $page.url.searchParams.get('childWindow') === '1';

  $: coreSidebarProps = {
    docData: sidebarDocData,
    actions,
    previewConfig: data.previewConfig,
    versions,
  } satisfies ComponentProps<Sidebar>;
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
        features={{ actions: !data.isPublishedVersion, docInfo: false, versions: false }}
        {...coreSidebarProps}
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
      {actions}
      {coreSidebarProps}
      user={data.session.adminUser
        ? {
            _id: data.session.adminEmail + data.session.adminUser.id.toString(),
            name: data.session.adminUser.firstname + ' ' + data.session.adminUser.lastname,
            color: colorHash.hex(
              data.session.adminUser.username + data.session.adminUser.id.toString()
            ),
            photo: genAvatar(
              data.session.adminUser.username + data.session.adminUser.id.toString()
            ),
            sessionId: '0',
          }
        : {
            _id: Math.random().toString(),
            name: 'Unknown',
            color: 'black',
            photo: '',
            sessionId: '0',
          }}
    />

    {#if showSidebarInline}
      <Sidebar
        isEmbedded
        features={{ actions: false, docInfo: true, versions: !childWindow }}
        {...coreSidebarProps}
      />
    {/if}
  </article>

  {#if showSidebarInline === false}
    <Sidebar
      features={{ actions: !data.isPublishedVersion, docInfo: true, versions: !childWindow }}
      {...coreSidebarProps}
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
