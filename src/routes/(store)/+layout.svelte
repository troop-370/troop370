<script lang="ts">
  import { afterNavigate, beforeNavigate } from '$app/navigation';
  import { Header } from '$lib/components/ui/header';
  import NProgress from 'nprogress';
  import '../../app.css';

  export let data;

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
</script>

<div class="frame">
  <Header navigation={data.navConfig} />
  <div class="content">
    <slot></slot>
  </div>
</div>

<style>
  div :global(.type h1),
  div :global(h1.type) {
    font-size: 2.25rem;
    line-height: 2.5rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    scroll-margin: 5rem;
  }

  /* @media (min-width: 1024px) {
    div :global(.type h1),
    div :global(h1.type) {
      font-size: 3rem;
      line-height: 1;
    }
  } */

  div :global(.type p),
  div :global(p.type) {
    line-height: 1.75rem;
  }
  div :global(.type p):not(:first-child),
  div :global(p.type):not(:first-child) {
    margin-top: 1.5rem;
  }
</style>
