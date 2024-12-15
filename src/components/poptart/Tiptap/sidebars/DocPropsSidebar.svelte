<script lang="ts">
  import { richTextParams } from '../richTextParams';
  import SidebarHeader from './SidebarHeader.svelte';

  let headerHeight = 100;
</script>

<div class="header" bind:clientHeight={headerHeight}>
  <SidebarHeader on:click={() => $richTextParams.set('props', 0)}>
    Document properties
  </SidebarHeader>
</div>

<div class="wrapper" style="height: calc(100% - {headerHeight}px);">TODO</div>

<!-- <script lang="ts">
  import { SchemaField } from '$lib/common/Field';
  import type Tiptap from '$lib/common/Tiptap/Tiptap.svelte';
  import { SidebarHeader } from '$lib/sidebar';
  import { TextBlock } from 'fluent-svelte';
  import type { ComponentProps } from 'svelte';
  import type { ProcessSchemaDef } from '../../../../routes/(standard)/[tenant]/cms/collection/[collection]/[item_id]/+layout';
  import Sidebar from '../../../../routes/(standard)/[tenant]/cms/collection/[collection]/[item_id]/Sidebar.svelte';
  import { richTextParams } from '../richTextParams';

  export let disabled = false;
  export let user: ComponentProps<Tiptap>['user'] | null = null;
  export let processSchemaDef: ProcessSchemaDef | undefined = undefined;
  export let ydoc: ComponentProps<Tiptap>['ydoc'];
  export let wsProvider: ComponentProps<Tiptap>['wsProvider'];
  export let coreSidebarProps: ComponentProps<Sidebar>;

  let headerHeight = 100;
</script>

<div class="header" bind:clientHeight={headerHeight}>
  <SidebarHeader on:click={() => $richTextParams.set('props', 0)}>Document properties</SidebarHeader>
</div>

<div class="props-wrapper" style="height: calc(100% - {headerHeight}px);">
  {#if $richTextParams.isActive('fs')}
    <div class="sidebar-wrapper">
      <Sidebar
        docInfo={coreSidebarProps.docInfo}
        disabled={coreSidebarProps.disabled}
        ydoc={coreSidebarProps.ydoc}
        stageDef={coreSidebarProps.stageDef}
        sharedData={coreSidebarProps.sharedData}
        awareness={coreSidebarProps.awareness}
        tenant={coreSidebarProps.tenant}
        permissions={coreSidebarProps.permissions}
        hideVersions={coreSidebarProps.hideVersions}
        isEmbedded
        features={{ docInfo: true, stage: true, preview: true }}
      />
    </div>

    {#if processSchemaDef && user}
      {#each processSchemaDef() as [key, def]}
        <SchemaField {key} {def} {ydoc} {disabled} {wsProvider} {user} mode="sidebar" />
      {/each}
    {/if}
  {:else}
    <TextBlock>To view document properties in this pane, enter fullscreen mode.</TextBlock>
  {/if}
</div>

<style>
  .props-wrapper {
    padding: 0 12px 0 12px;
    overflow: auto;
    scroll-behavior: smooth;
  }

  .sidebar-wrapper {
    background-color: var(--fds-control-fill-default);
    padding: 0 12px 18px 12px;
    margin-bottom: 18px;
    border-radius: var(--fds-control-corner-radius);
  }
</style> -->

<style>
  .wrapper {
    padding: 4px 12px 12px 12px;
    overflow: auto;
    scroll-behavior: smooth;
    box-sizing: border-box;
  }
</style>
