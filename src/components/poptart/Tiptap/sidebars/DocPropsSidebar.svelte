<script lang="ts">
  import { TextBlock } from 'fluent-svelte';
  import type { ComponentProps } from 'svelte';
  import Fields from '../../../../routes/(admin)/poptart/cms/collection/[uid]/[documentId]/Fields.svelte';
  import Sidebar from '../../../../routes/(admin)/poptart/cms/collection/[uid]/[documentId]/Sidebar.svelte';
  import { richTextParams } from '../richTextParams';
  import SidebarHeader from './SidebarHeader.svelte';

  export let disabled = false;
  export let coreSidebarProps: NonNullable<ComponentProps<Fields>['coreSidebarProps']>;
  export let sessionAdminToken: ComponentProps<Fields>['sessionAdminToken'];
  export let defs: ComponentProps<Fields>['defs'];
  export let docDataStore: ComponentProps<Fields>['docDataStore'];
  export let variant: ComponentProps<Fields>['variant'];
  export let editorIsFullscreen = false;
  export let user: ComponentProps<Fields>['user'];

  let headerHeight = 100;
</script>

<div class="header" bind:clientHeight={headerHeight}>
  <SidebarHeader on:click={() => $richTextParams.set('props', 0)}>
    Document properties
  </SidebarHeader>
</div>

<div class="props-wrapper" style="height: calc(100% - {headerHeight}px);">
  {#if editorIsFullscreen}
    <div class="sidebar-wrapper">
      <Sidebar {...coreSidebarProps} isEmbedded features={{ docInfo: true, workflowStage: true }} />
    </div>

    <Fields
      {defs}
      docData={docDataStore}
      {sessionAdminToken}
      {variant}
      {disabled}
      actions={coreSidebarProps?.actions}
      {coreSidebarProps}
      isEmbedded
      {user}
    />
  {:else}
    <TextBlock>To view document properties in this pane, enter fullscreen mode.</TextBlock>
  {/if}
</div>

<style>
  .props-wrapper {
    padding: 0 12px 0 12px;
    overflow: auto;
    scroll-behavior: smooth;
    box-sizing: border-box;
  }

  .sidebar-wrapper {
    background-color: var(--fds-control-fill-default);
    padding: 0 12px 18px 12px;
    margin-bottom: 18px;
    border-radius: var(--fds-control-corner-radius);
  }
</style>
