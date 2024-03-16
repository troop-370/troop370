<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import FieldWrapper from '$components/admin/FieldWrapper.svelte';
  import { FileExplorerDialog } from '$lib/common/FileExplorer';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { RichTiptap } from '$lib/common/Tiptap/index.js';
  import { motionMode } from '$stores/motionMode.js';
  import { updatePreviewsWhileComposing } from '$stores/updatePreviewsWhileComposing.js';
  import { blocksToProsemirror, notEmpty } from '$utils';
  import { addToY } from '$utils/y/addTToY';
  import { createYStore } from '$utils/y/createYStore.js';
  import { processSchemaDef } from '$utils/y/processSchemaDef.js';
  import { copy } from 'copy-anything';
  import { Button, TextBlock, TextBox, ToggleSwitch } from 'fluent-svelte';
  import { expoOut } from 'svelte/easing';
  import { writable } from 'svelte/store';
  import { fly } from 'svelte/transition';

  export let data;
  $: ({ collectionConfig } = data);

  const { collection, item_id } = data.params;

  const deconstructedSchema = copy(data.deconstructedSchema);

  const {
    ydoc,
    webProvider,
    wsProvider,
    awareness,
    synced,
    connected,
    sharedData,
    fullSharedData,
  } = createYStore({
    collection: collection,
    id: item_id,
    user: data.yuser,
    deconstructedSchema: deconstructedSchema,
    // disable syncing via providers (disables collaborative editing)
    providerOpts: { noWebRtcConn: true, noWebsocketConn: true },
  });

  const docData = writable<Record<string, any>>(data.docData);

  let alertCount = 0;

  let currentDocAndPreviewWidth = 1000;
  $: previewSrc = data.settings.preview?.draft?.url || undefined;
  // $: showPreviewWidth = previewSrc ? 1400 : 99999999999;
  $: showPreviewWidth = 99999999999;
  $: tabsShown = currentDocAndPreviewWidth <= showPreviewWidth;

  let currentContentWidth = 1000;
  $: showSidebarInline = currentContentWidth <= 900;

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

  let filesDialogOpen = false;
  let saveDocDialogOpen = false;

  //
  $: fullscreen =
    $page.url.searchParams.get('fs') === '1' ||
    $page.url.searchParams.get('fs') === '3' ||
    $page.url.searchParams.get('fs') === 'force';
  afterNavigate(() => {
    fullscreen =
      new URL(window.location.href).searchParams.get('fs') === '1' ||
      new URL(window.location.href).searchParams.get('fs') === '3' ||
      $page.url.searchParams.get('fs') === 'force';
  });

  // update shared rich text with doc data
  let hasInitialDocData = false;
  $: if ($ydoc && !hasInitialDocData) {
    hasInitialDocData = true;

    const dataToSet = Object.fromEntries(
      (data.settings.defs || [])
        .map(([key, { type }]) => {
          if (type === 'blocks') {
            return [key, JSON.stringify(blocksToProsemirror($docData[key]) || [])];
          }
        })
        .filter(notEmpty)
    );

    addToY({
      ydoc: $ydoc,
      inputData: dataToSet,
      schemaDef: deconstructedSchema,
      onlyProvided: true,
    }).catch((error) => {
      console.error(error);
    });
  }
</script>

<div class="content-wrapper" bind:clientWidth={currentContentWidth}>
  <div>
    <button on:click={() => (filesDialogOpen = !filesDialogOpen)}>Toggle files dialog</button>
    <FileExplorerDialog
      session={data.session}
      url={data.url}
      bind:open={filesDialogOpen}
      handleAction={async (files) => {
        console.log('Selected files:', files);
      }}
    />
  </div>

  <div
    class="doc-and-preview"
    bind:clientWidth={currentDocAndPreviewWidth}
    class:showPreview={currentDocAndPreviewWidth > showPreviewWidth}
  >
    <div class="document-fields">
      <div style="height: 100%; overflow: auto; display: flex; flex-direction: column;">
        <div style="display: block; height: 100%;">
          <div
            style="max-width: 800px; padding: {showSidebarInline ? 20 : 40}px; margin: 0px auto;"
          >
            {#if tabsShown}
              <div class="tabs-container" class:reduceSpaceAbove={showSidebarInline}>
                <!-- {#if showSidebarInline}
                  <div style="margin: 0 11px;">
                    <Sidebar
                      docInfo={coreSidebarProps.docInfo}
                      disabled={coreSidebarProps.disabled}
                      ydoc={coreSidebarProps.ydoc}
                      stageDef={coreSidebarProps.stageDef}
                      sharedData={coreSidebarProps.sharedData}
                      fullSharedData={coreSidebarProps.fullSharedData}
                      awareness={coreSidebarProps.awareness}
                      tenant={coreSidebarProps.tenant}
                      preview={coreSidebarProps.preview}
                      permissions={coreSidebarProps.permissions}
                      hideVersions={coreSidebarProps.hideVersions}
                      actions={coreSidebarProps.actions}
                      features={{ actions: true }}
                      isEmbedded
                    />
                  </div>
                {/if} -->
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
                  <div
                    class="tabline"
                    style="width: {activeTabWidth}px; left: {activeTabLeft}px;"
                  />
                </div>
              </div>
            {/if}

            {#if !$docData}
              <div
                in:fly={{ y: 40, duration: $motionMode === 'reduced' ? 0 : 270, easing: expoOut }}
                class="message-box"
              >
                <FluentIcon
                  name="ErrorCircle24Regular"
                  style="width: 32px; height: 32px; fill: var(--fds-accent-default);"
                />
                <TextBlock variant="bodyStrong">
                  This document does not exist <i>or</i> you do not have access.
                </TextBlock>
                <TextBlock style="margin-top: -14px;">
                  If you know this document exists, ask someone with access to grant you access.
                </TextBlock>
              </div>
            {:else}
              <div
                class="alerts-wrapper"
                class:tabsShown
                class:noMargin={tabsShown === false && alertCount === 0}
              >
                <!-- <Alerts
                  bind:alertCount
                  {isOldVersion}
                  {connected}
                  {publishLocked}
                  {sharedData}
                  {actions}
                  {publishStage}
                /> -->
              </div>

              {#if tabsShown && (activeTab === 'preview' || $updatePreviewsWhileComposing)}
                {#if previewSrc && activeTab === 'preview'}
                  <div style="margin: 20px 0;">
                    <ToggleSwitch bind:checked={$updatePreviewsWhileComposing}>
                      Update previews while composing
                    </ToggleSwitch>
                  </div>
                {/if}
                PREVIEW FRAME
                <!-- <PreviewFrame
                  src={previewSrc}
                  fullSharedData={advancedSharedData}
                  noOuterMargin
                  hide={activeTab !== 'preview'}
                /> -->
              {/if}

              <!-- {#if showSidebarInline}
                <div class="sidebar-embed" style={activeTab === 'preview' ? 'display: none;' : ''}>
                  <Sidebar
                    docInfo={coreSidebarProps.docInfo}
                    disabled={coreSidebarProps.disabled}
                    ydoc={coreSidebarProps.ydoc}
                    stageDef={coreSidebarProps.stageDef}
                    sharedData={coreSidebarProps.sharedData}
                    fullSharedData={coreSidebarProps.fullSharedData}
                    awareness={coreSidebarProps.awareness}
                    tenant={coreSidebarProps.tenant}
                    preview={coreSidebarProps.preview}
                    permissions={coreSidebarProps.permissions}
                    hideVersions={coreSidebarProps.hideVersions}
                    actions={coreSidebarProps.actions}
                    features={{ docInfo: true, stage: true, download: true, preview: true }}
                    isEmbedded
                  />
                </div>
              {/if} -->

              {#if !tabsShown || activeTab === 'compose'}
                {#each data.settings.defs || [] as [key, { field, ...def }]}
                  <FieldWrapper
                    forId={key}
                    label={field.label || key}
                    description={field.description}
                  >
                    {#if def.type === 'string'}
                      <TextBox id={key} bind:value={$docData[key]} />
                    {:else if def.type === 'boolean'}
                      <ToggleSwitch id={key} bind:checked={$docData[key]} />
                    {:else if def.type === 'blocks'}
                      {#if !!$ydoc && !!$wsProvider && !!fullSharedData}
                        <RichTiptap
                          disabled={false}
                          {ydoc}
                          ydocKey={key}
                          {wsProvider}
                          user={data.yuser}
                          options={deconstructedSchema.find(([_key]) => _key === key)?.[1].field
                            ?.tiptap}
                          {fullscreen}
                          {processSchemaDef}
                          {fullSharedData}
                          dynamicPreviewHref=""
                          actions={[]}
                          {connected}
                        >
                          <svelte:fragment slot="alerts">
                            <slot name="alerts" />
                          </svelte:fragment>
                        </RichTiptap>
                      {:else}
                        <p>
                          Error: The collaborative document or websocket was not found ({key}).
                        </p>
                      {/if}
                    {:else}
                      Unsupported content type: "{def.type}"
                      <pre>{JSON.stringify(def, null, 2)}</pre>
                      <pre>{JSON.stringify($docData[key], null, 2)}</pre>
                    {/if}
                  </FieldWrapper>
                {/each}
              {/if}

              <!-- {#if showSidebarInline}
                <div class="sidebar-embed" style={activeTab === 'preview' ? 'display: none;' : ''}>
                  <Sidebar
                    docInfo={coreSidebarProps.docInfo}
                    disabled={coreSidebarProps.disabled}
                    ydoc={coreSidebarProps.ydoc}
                    stageDef={coreSidebarProps.stageDef}
                    sharedData={coreSidebarProps.sharedData}
                    fullSharedData={coreSidebarProps.fullSharedData}
                    awareness={coreSidebarProps.awareness}
                    tenant={coreSidebarProps.tenant}
                    preview={coreSidebarProps.preview}
                    permissions={coreSidebarProps.permissions}
                    hideVersions={coreSidebarProps.hideVersions}
                    actions={coreSidebarProps.actions}
                    features={{
                      access: true,
                      actions: false,
                      current: true,
                      docInfo: false,
                      download: false,
                      preview: false,
                      stage: false,
                      versions: true,
                    }}
                    isEmbedded
                  />
                </div>
              {/if} -->
            {/if}
          </div>
        </div>
      </div>
    </div>
    {#if currentDocAndPreviewWidth > showPreviewWidth}
      <div class="concurrent-preview">
        PREVIEW FRAME
        <!-- <PreviewFrame src={previewSrc} fullSharedData={advancedSharedData} noOuterMargin /> -->
      </div>
    {/if}
  </div>
  <!-- {#if !showSidebarInline}
    <Sidebar
      docInfo={coreSidebarProps.docInfo}
      disabled={coreSidebarProps.disabled}
      ydoc={coreSidebarProps.ydoc}
      stageDef={coreSidebarProps.stageDef}
      sharedData={coreSidebarProps.sharedData}
      fullSharedData={coreSidebarProps.fullSharedData}
      awareness={coreSidebarProps.awareness}
      tenant={coreSidebarProps.tenant}
      preview={coreSidebarProps.preview}
      permissions={coreSidebarProps.permissions}
      hideVersions={coreSidebarProps.hideVersions}
      actions={coreSidebarProps.actions}
    />
  {/if} -->
</div>

<pre>
  {JSON.stringify($collectionConfig, null, 2)}
</pre>

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
    /* flex-grow: 1; */
  }

  .concurrent-preview {
    min-width: 0;
    overflow: auto;
    flex-grow: 1;
    padding: 40px 40px 40px 0;
  }

  .alerts-wrapper {
    margin: 0 0 20px 0;
  }
  .alerts-wrapper.tabsShown {
    margin-top: 20px;
  }
  .alerts-wrapper.noMargin {
    margin-top: 0;
  }

  .tabs-container {
    margin-left: -11px;
    width: calc(100% + 22px);
    position: sticky;
    top: 0;
    padding-top: 40px;
    margin-top: -40px;
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

  .message-box {
    width: 100%;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    align-items: center;
    justify-content: center;
    padding: 8px;
    margin-top: 20px;
  }

  .sidebar-embed {
    background-color: var(--fds-control-fill-default);
    padding: 0 12px 18px 12px;
    margin-bottom: 18px;
    border-radius: var(--fds-control-corner-radius);
  }
</style>
