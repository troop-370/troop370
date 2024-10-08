<script lang="ts">
  import { afterNavigate, beforeNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import TopNav from '$components/TopNavigation/TopNav.svelte';
  import { scrollTop } from '$stores/scrollTop';
  import { title } from '$stores/title';
  import NProgress from 'nprogress';
  import { afterUpdate, onMount } from 'svelte';

  export let data;

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

  // configure the navigation progress bar
  NProgress.configure({
    parent: 'body',
    easing: 'ease',
    speed: 500,
    trickle: true,
    trickleSpeed: 200,
    showSpinner: false,
  });

  // show progress bar on page navigate
  beforeNavigate((evt) => {
    if (!evt.willUnload) NProgress.start();
  });

  // hide progress bar on navigation end
  afterNavigate(() => {
    NProgress.done();
  });

  let wrapper: HTMLDivElement | null = null;
  onMount(() => {
    wrapper?.addEventListener('scroll', () => {
      scrollTop.set(wrapper?.scrollTop || 0);
    });
  });
</script>

<svelte:head>
  <title>{title_}</title>
</svelte:head>

<div id="global-wrapper">
  {#if (path.indexOf('/email') !== 0 || path.indexOf('/emails') === 0) && path.indexOf('/basic-login') !== 0 && $page.url.searchParams.get('hideNav') !== '1'}
    <TopNav
      groups={data.navConfig}
      hideShadow={$page.url.pathname.slice(0, 14) === '/pay/pinestraw'}
    />
  {/if}

  <div id="content-wrapper" bind:this={wrapper} data-scroll={$scrollTop}>
    <slot />
  </div>
</div>

<style>
  @media screen {
    div#global-wrapper {
      display: grid;
      grid-template-rows: auto 1fr;
      height: 100vh;
    }

    div#content-wrapper {
      overflow: auto;
    }
  }
</style>
