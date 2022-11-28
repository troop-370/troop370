<script lang="ts">
  import { page } from '$app/stores';
  import TopNav from '$components/TopNavigation/TopNav.svelte';
  import { title } from '$stores/title';
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

<style lang="scss">
  @use '@material/button/index' as mdc-button;
  @use '@material/ripple/index' as mdc-ripple;

  :global(.mdc-button-outlined--on-primary) {
    @include mdc-button.ink-color(#e0e0e0);
    @include mdc-button.outline-color(#e0e0e0);
  }

  :global(.mdc-button-outlined--on-primary .mdc-button__ripple) {
    @include mdc-ripple.states-base-color('on-primary');
  }

  /* use correct font for button labels */
  :global(.mdc-button .mdc-button__label) {
    text-transform: uppercase;
    font-family: var(--font-headline);
    font-weight: 700;
  }
</style>
