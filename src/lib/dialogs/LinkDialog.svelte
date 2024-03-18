<script lang="ts">
  import { page } from '$app/stores';
  import { FieldWrapper } from '$lib/common/Field';
  import { FileExplorerDialog } from '$lib/common/FileExplorer';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { hasKey } from '$utils';
  import type { Editor } from '@tiptap/core';
  import { Button, ContentDialog, IconButton, ProgressRing, TextBox } from 'fluent-svelte';
  import { tick } from 'svelte';

  export let open = false;
  export let editor: Editor | null;
  export let title = 'Insert link';

  export let handleAction: (() => Promise<void>) | undefined = undefined;
  export let handleSumbit: ((link: string, fileId?: number) => Promise<void>) | undefined =
    undefined;
  export let handleCancel: (() => Promise<void>) | undefined = undefined;

  let loadingSubmit = false;
  let loadingCancel = false;

  let selectFileLinkDialogOpen = false;

  let link = '';
  $: {
    link;
    fileId = undefined;
  }
  let fileId: number | undefined = undefined;
  $: if (!open) {
    link = editor?.getAttributes('link').href || '';
    fileId = editor?.getAttributes('link').file?.id;
    if (fileId) activeTab = 'file';
  }

  let tabsContainerElement: HTMLDivElement;
  let activeTab = 'url';
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

<ContentDialog {title} bind:open size="standard" style="min-height: 280px;">
  <div class="tabs-container">
    <div class="tabs" bind:this={tabsContainerElement}>
      <Button
        data-tab={'url'}
        on:click={handleTabClick}
        on:mouseenter={handleTabMouseEnter}
        on:mouseleave={handleTabMouseLeave}
      >
        URL
      </Button>
      <Button
        data-tab={'file'}
        on:click={handleTabClick}
        on:mouseenter={handleTabMouseEnter}
        on:mouseleave={handleTabMouseLeave}
      >
        File
      </Button>
      <div class="tabline" style="width: {activeTabWidth}px; left: {activeTabLeft}px;" />
    </div>
  </div>

  {#if activeTab === 'url'}
    <FieldWrapper label="" forId="link">
      <TextBox type="text" bind:value={link} id="link" />
    </FieldWrapper>
  {/if}
  {#if activeTab === 'file'}
    <FieldWrapper label="" forId="file">
      <Button on:click={() => (selectFileLinkDialogOpen = !selectFileLinkDialogOpen)}>
        <FluentIcon name="DocumentLink24Regular" mode="buttonIconLeft" />
        {#if fileId}
          Change file
        {:else}
          Select file
        {/if}
      </Button>
      {#if fileId && link}
        {link.split('/').slice(4).join('/').split('?')[0]}
      {/if}
    </FieldWrapper>
  {/if}

  <svelte:fragment slot="footer">
    <Button
      variant="accent"
      disabled={!link}
      on:click={async () => {
        loadingSubmit = true;
        await handleAction?.();
        await handleSumbit?.(link, fileId);
        open = false;
        link = '';
        loadingSubmit = false;
      }}
    >
      {#if loadingSubmit}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else if editor?.getAttributes('link').href}
        Update link
      {:else}
        Insert link
      {/if}
    </Button>
    <Button
      disabled={!editor?.getAttributes('link').href}
      on:click={async () => {
        loadingSubmit = true;
        await handleAction?.();
        await handleSumbit?.('');
        open = false;
        link = '';
        loadingSubmit = false;
      }}
    >
      {#if loadingSubmit}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        Remove link
      {/if}
    </Button>
    <Button
      on:click={async () => {
        loadingCancel = true;
        await handleAction?.();
        await handleCancel?.();
        loadingCancel = false;
        open = false;
        link = '';
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

<FileExplorerDialog
  session={$page.data.session}
  url={$page.data.url}
  bind:open={selectFileLinkDialogOpen}
  handleAction={async (files) => {
    if (files && files.length > 0) {
      const _file = files[0];
      if (hasKey(_file, 'mime')) {
        link = _file.url;
        await tick();
        fileId = _file.id;
      }
    }
  }}
/>

<style>
  .tabs-container {
    margin-left: -11px;
    width: calc(100% + 22px);
    margin-bottom: -10px;
  }

  .tabs {
    position: relative;
    display: flex;
    flex-direction: row;
    height: 30px;
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
