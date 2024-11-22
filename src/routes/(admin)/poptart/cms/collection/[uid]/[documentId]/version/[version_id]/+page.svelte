<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import Editor from '../../Editor.svelte';
  import Sidebar from '../../Sidebar.svelte';

  export let data;
  $: ({ version, docDataStore, collectionConfig } = data);
  $: ({ docData } = docDataStore);

  $: sidebarDocData = {
    ...$docData,
    updatedAt: version?.createdAt,
    status: version?.status,
    documentId: $docData.documentId + '__' + version?.id,
  };

  let currentContentWidth = 1000;
  $: showSidebarInline = currentContentWidth <= 900;
  $: childWindow =
    (!!browser && !!window.name) || $page.url.searchParams.get('childWindow') === '1';
</script>

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
        save: () => {},
        defs: data.defs,
      }}
      disabled
    />

    {#if showSidebarInline}
      <Sidebar
        isEmbedded
        docData={sidebarDocData}
        features={{ actions: false, docInfo: true, versions: !childWindow }}
        previewConfig={data.previewConfig}
        versions={data.versions}
      />
    {/if}
  </article>

  {#if showSidebarInline === false}
    <Sidebar
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
