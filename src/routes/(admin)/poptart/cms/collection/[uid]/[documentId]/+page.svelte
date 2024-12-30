<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import PreviewFrame from '$components/poptart/Tiptap/PreviewFrame.svelte';
  import { title } from '$stores/title';
  import { updatePreviewsWhileComposing } from '$stores/updatePreviewsWhileComposing';
  import { genAvatar, hasKey, notEmpty, openWindow } from '$utils';
  import _ColorHash from 'color-hash';
  import { Button, ToggleSwitch } from 'fluent-svelte';
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
  $: ({
    collectionConfig,
    docDataStore,
    saveStatus,
    actions: partialActions,
    versions,
    stages,
  } = data);
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

  $: disabled = data.isPublishedVersion || $saveStatus.startsWith('Setting stage');

  $: actions = [
    ...$partialActions,
    $collectionConfig.options?.draftAndPublish !== false
      ? {
          id: 'publish',
          label: 'Publish',
          action: () => {
            publishDocumentDialogOpen = true;
          },
          disabled:
            disabled || ($saveStatus !== 'Unsaved changes' && $docData.status === 'published'),
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

  $: coreSidebarProps = {
    docData: sidebarDocData,
    disabled,
    actions,
    previewConfig: data.previewConfig,
    versions,
    stages,
    setStage: data.setStage,
    showStageSpinner: $saveStatus.startsWith('Setting stage'),
  } satisfies ComponentProps<Sidebar>;

  let currentDocAndPreviewWidth = 1000;
  $: previewSrc = $collectionConfig.dynamicPreviewHref;
  $: showPreviewWidth = previewSrc ? 1400 : 99999999999;
  $: tabsShown = currentDocAndPreviewWidth <= showPreviewWidth;

  let currentContentWidth = 1000;
  $: showSidebarInline = currentContentWidth <= 900;
  $: childWindow =
    (!!browser && !!window.name) || $page.url.searchParams.get('childWindow') === '1';

  let tabsContainerElement: HTMLDivElement;
  let activeTab = 'compose';
  let mouseOverActiveTab = false;
  $: ({ activeTabWidth, activeTabLeft } = (() => {
    const tabsContainerRect = tabsContainerElement?.getBoundingClientRect();
    const activeTabRect = tabsContainerElement
      ?.querySelector(`[data-tab='${activeTab}']`)
      ?.getBoundingClientRect();
    return {
      activeTabWidth: (activeTabRect?.width || 0) - (mouseOverActiveTab ? 0 : 22),
      activeTabLeft:
        (activeTabRect?.left || 0) - (tabsContainerRect?.left || 0) + (mouseOverActiveTab ? 0 : 11),
    };
  })());
  $: if (!tabsShown) activeTab = 'compose';

  function handleTabClick(evt: CustomEvent) {
    const target = evt.target as HTMLElement | undefined;
    const clickedTabName = target?.getAttribute('data-tab');
    if (clickedTabName) {
      activeTab = clickedTabName;
      mouseOverActiveTab = true;
    }
  }
  function handleTabMouseEnter(evt: CustomEvent) {
    const target = evt.target as HTMLElement | undefined;
    const tabName = target?.getAttribute('data-tab');
    if (tabName === activeTab) mouseOverActiveTab = true;
    else mouseOverActiveTab = false;
  }

  function handleTabMouseLeave(evt: CustomEvent) {
    const target = evt.target as HTMLElement | undefined;
    const tabName = target?.getAttribute('data-tab');
    if (tabName === activeTab) mouseOverActiveTab = false;
    else mouseOverActiveTab = false;
  }
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
  <div
    class="doc-and-preview"
    bind:clientWidth={currentDocAndPreviewWidth}
    class:showPreview={currentDocAndPreviewWidth > showPreviewWidth}
  >
    <div class="document-fields">
      <div class="article-wrapper">
        <article style="padding: {showSidebarInline ? 20 : 40}px;">
          {#if tabsShown}
            <div class="tabs-container" class:reduceSpaceAbove={showSidebarInline}>
              {#if showSidebarInline}
                <div style="margin: 0 11px;">
                  <Sidebar
                    isEmbedded
                    features={{
                      actions: !data.isPublishedVersion,
                    }}
                    {...coreSidebarProps}
                  />
                </div>
              {/if}
              <div class="tabs" bind:this={tabsContainerElement}>
                <Button
                  data-tab={'compose'}
                  on:click={handleTabClick}
                  on:mouseenter={handleTabMouseEnter}
                  on:mouseleave={handleTabMouseLeave}
                  disabled={!$docData}
                >
                  Compose
                </Button>
                <Button
                  data-tab={'preview'}
                  on:click={handleTabClick}
                  on:mouseenter={handleTabMouseEnter}
                  on:mouseleave={handleTabMouseLeave}
                  disabled={!$docData}
                >
                  Preview
                </Button>
                <div class="tabline" style="width: {activeTabWidth}px; left: {activeTabLeft}px;" />
              </div>
            </div>
          {/if}

          {#if tabsShown && (activeTab === 'preview' || $updatePreviewsWhileComposing)}
            {#if previewSrc && activeTab === 'preview'}
              <div style="margin: 20px 0;">
                <ToggleSwitch bind:checked={$updatePreviewsWhileComposing}>
                  Update previews while composing
                </ToggleSwitch>
              </div>
            {/if}
            <PreviewFrame
              src={previewSrc}
              fullSharedData={docData}
              noOuterMargin
              hide={activeTab !== 'preview'}
            />
          {/if}

          {#if showSidebarInline && $stages && $stages.length > 0}
            <div class="sidebar-embed" style={activeTab === 'preview' ? 'display: none;' : ''}>
              <Sidebar
                isEmbedded
                features={{
                  workflowStage: true,
                }}
                {...coreSidebarProps}
              />
            </div>
          {/if}

          <div style={activeTab === 'preview' ? 'display: none;' : ''}>
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
              {disabled}
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
          </div>

          {#if showSidebarInline}
            <div class="sidebar-embed" style={activeTab === 'preview' ? 'display: none;' : ''}>
              <Sidebar
                isEmbedded
                features={{
                  actions: false,
                  docInfo: true,
                  versions: !childWindow,
                }}
                forceShowTitles
                {...coreSidebarProps}
              />
            </div>
          {/if}
        </article>
      </div>
    </div>
    {#if currentDocAndPreviewWidth > showPreviewWidth}
      <div class="concurrent-preview">
        <PreviewFrame src={previewSrc} fullSharedData={docData} noOuterMargin />
      </div>
    {/if}
  </div>
  {#if showSidebarInline === false}
    <Sidebar
      features={{
        actions: !data.isPublishedVersion,
        docInfo: true,
        workflowStage: true,
        versions: !childWindow,
      }}
      {...coreSidebarProps}
    />
  {/if}
</div>

<style>
  .content-wrapper {
    display: flex;
    flex-direction: row;
    width: 100%;
    overflow: hidden;
    height: 100%;
    box-sizing: border-box;
  }

  .doc-and-preview {
    min-width: 0;
    overflow: auto;
    flex-grow: 1;
    position: unset !important;
    display: flex;
    flex-direction: column;
  }
  .doc-and-preview.showPreview {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .document-fields {
    min-width: 0;
    overflow: auto;
    box-sizing: border-box;
    width: 100%;
    /* flex-grow: 1; */
  }

  .article-wrapper {
    width: 100%;
    overflow: hidden auto;
    box-sizing: border-box;
  }

  article {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    box-sizing: border-box;
  }

  .sidebar-embed {
    background-color: var(--fds-control-fill-default);
    padding: 0 12px 18px 12px;
    margin-bottom: 18px;
    border-radius: var(--fds-control-corner-radius);
  }

  .concurrent-preview {
    min-width: 0;
    overflow: auto;
    flex-grow: 1;
    padding: 40px 40px 40px 0;
  }

  .tabs-container {
    margin-left: -11px;
    width: calc(100% + 22px);
    position: sticky;
    top: 0;
    padding-top: 30px;
    margin-top: -40px;
    margin-bottom: 20px;
    background-color: #ffffff;
    z-index: 9;
  }
  .tabs-container.reduceSpaceAbove {
    padding-top: 20px;
    margin-top: -20px;
  }
  .tabs-container.reduceSpaceAbove :global(.button-row) {
    margin-top: 0px;
  }
  @media (prefers-color-scheme: dark) {
    .tabs-container {
      background-color: #272727;
    }
  }

  .tabs {
    position: relative;
    display: flex;
    flex-direction: row;
    height: 30px;
    -webkit-app-region: no-drag;
    app-region: no-drag;
  }

  .tabs :global(.button.style-standard),
  .tabs :global(.button.style-standard.disabled) {
    background-color: transparent;
    box-shadow: none;
    padding-left: 11px;
    padding-right: 11px;
  }

  .tabs :global(.button.style-standard):hover:not(disabled):not(.disabled) {
    background-color: var(--fds-subtle-fill-secondary);
  }

  .tabs :global(.button.style-standard):active:not(disabled):not(.disabled) {
    background-color: var(--fds-subtle-fill-tertiary);
    color: var(--fds-text-secondary);
  }

  .tabs :global(.button.style-standard[data-contextual='true']) {
    color: var(--fds-accent-default);
  }

  .tabline {
    margin: 0px;
    bottom: 0px;
    left: 11px;
    width: 58.625px;
    height: 2.4px;
    pointer-events: none;
    position: absolute;
    transition: all 150ms cubic-bezier(0.17, 0.17, 0, 1) 0s;
    float: left;
    background-color: var(--fds-accent-default);
    border-radius: 6px;
  }
</style>
