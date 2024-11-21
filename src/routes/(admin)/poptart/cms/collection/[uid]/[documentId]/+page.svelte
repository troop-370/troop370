<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { title } from '$stores/title';
  import DeveloperDialog from './DeveloperDialog.svelte';
  import Editor from './Editor.svelte';
  import Sidebar from './Sidebar.svelte';

  export let data;
  $: ({ collectionConfig, docDataStore, saveStatus, actions: partialActions } = data);
  $: ({ docData } = docDataStore);

  let developerDialogOpen = false;

  $: if (browser) {
    title.set(`${$docDataStore[$collectionConfig.settings.mainField]} - ${$saveStatus}`);
  }

  $: actions = [
    ...$partialActions,
    {
      id: 'developer',
      label: 'Open developer dialog',
      icon: 'DeveloperTools',
      action: () => {
        developerDialogOpen = !developerDialogOpen;
      },
    },
  ] satisfies typeof $partialActions;

  let currentContentWidth = 1000;
  $: showSidebarInline = currentContentWidth <= 900;
  $: childWindow =
    (!!browser && !!window.name) || $page.url.searchParams.get('childWindow') === '1';
</script>

<DeveloperDialog bind:open={developerDialogOpen} {data} />

<div class="content-wrapper" bind:clientWidth={currentContentWidth}>
  <article style="padding: {showSidebarInline ? 20 : 40}px;">
    {#if showSidebarInline}
      <Sidebar
        isEmbedded
        {actions}
        docData={$docData}
        features={{ actions: !childWindow, docInfo: false, versions: false }}
      />
    {/if}

    <Editor
      data={{
        collectionConfig,
        docDataStore,
        session: data.session,
        save: data.save,
        defs: data.defs,
      }}
      disabled={data.isPublishedVersion}
    />

    {#if showSidebarInline}
      <Sidebar
        isEmbedded
        {actions}
        docData={$docData}
        features={{ actions: false, docInfo: true, versions: !childWindow }}
      />
    {/if}
  </article>

  {#if showSidebarInline === false}
    <Sidebar
      {actions}
      docData={$docData}
      features={{ actions: !childWindow, docInfo: true, versions: !childWindow }}
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
