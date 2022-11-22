<script lang="ts">
  import { page } from '$app/stores';
  import { title } from '$stores/title';
  import TopNav from '$components/TopNavigation/TopNav.svelte';
  import { afterUpdate } from 'svelte';
  import type { LayoutData } from './$houdini';

  export let data: LayoutData;
  $: ({ TenantDetails } = data);
  $: navConfig = JSON.parse($TenantDetails.data?.webConfigPublic?.config || '{}');

  // keep track of the page path
  export let path: string = $page.url.pathname;
  afterUpdate(() => {
    // keep the path updated when the component changes
    path = $page.url.pathname;
  });

  // create the document title
  $: title_ = (() => {
    if (path === '/' || !$title) return 'BSA Troop 370';
    return `${$title} | BSA Troop 370`;
  })();
</script>

<svelte:head>
  <title>{title_}</title>
</svelte:head>

<TopNav groups={navConfig.group} />

<slot />
