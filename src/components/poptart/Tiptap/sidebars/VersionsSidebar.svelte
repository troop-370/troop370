<script lang="ts">
  import { TextBlock } from 'fluent-svelte';
  import PageData from '../../../../routes/(admin)/poptart/cms/collection/[uid]/[documentId]/+page.svelte';
  import Sidebar from '../../../../routes/(admin)/poptart/cms/collection/[uid]/[documentId]/Sidebar.svelte';
  import { richTextParams } from '../richTextParams';
  import SidebarHeader from './SidebarHeader.svelte';

  export let versions: PageData['versions'] | undefined = undefined;

  let headerHeight = 100;
</script>

<div class="header" bind:clientHeight={headerHeight}>
  <SidebarHeader on:click={() => $richTextParams.set('versions', 0)}>Version history</SidebarHeader>
</div>

<div class="wrapper" style="height: calc(100% - {headerHeight}px);">
  {#if versions}
    <Sidebar docData={{}} {versions} features={{ versions: true }} />
  {:else}
    <TextBlock>No versions could be found for this document.</TextBlock>
  {/if}
</div>

<style>
  .wrapper {
    padding: 4px 16px 12px 16px;
    overflow: auto;
    scroll-behavior: smooth;
    box-sizing: border-box;
  }
</style>
