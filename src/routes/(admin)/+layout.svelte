<script lang="ts">
  import { page } from '$app/stores';
  import Ribbon from '$components/admin/Ribbon.svelte';
  import Titlebar from '$components/admin/Titlebar.svelte';
  import { afterUpdate } from 'svelte';

  export let data;

  // keep track of the page path
  export let path: string = $page.url.pathname;
  afterUpdate(() => {
    // keep the path updated when the component changes
    path = $page.url.pathname;
  });
</script>

<svelte:head>
  <title>Troop 370 Admin</title>
  <link rel="manifest" href="/admin/manifest.webmanifest">
</svelte:head>

{#if !['/admin/login'].includes(path)}
  <div id="admin">
    <div id="admin-header">
      <Titlebar {data} />
      <Ribbon />
    </div>

    <div id="admin-sidebar" />

    <div id="admin-content">
      <slot />
    </div>
  </div>
{:else}
  <slot />
{/if}

<style>
  #admin {
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 0px 1fr;
    grid-template-rows: 73px 1fr;
    grid-template-areas:
      'header header'
      'sidebar content';
    height: 100vh;
    overflow: hidden;
  }

  #admin-header {
    box-sizing: border-box;
    grid-area: header;
    background-color: var(--titlebar-bg);
  }

  #admin-sidebar {
    box-sizing: border-box;
    grid-area: sidebar;
    background-color: var(--titlebar-bg);
  }

  #admin-content {
    box-sizing: border-box;
    height: 100%;
    overflow: auto;
    background-color: var(--titlebar-bg);
  }
</style>
