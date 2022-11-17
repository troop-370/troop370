<script lang="ts">
  import { page } from '$app/stores';
  import { title } from '$stores/title';
  import { afterUpdate } from 'svelte';

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

<slot />
