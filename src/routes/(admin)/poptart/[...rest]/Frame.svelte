<script lang="ts">
  import { browser } from '$app/environment';
  import { afterNavigate, goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { motionMode } from '$stores/motionMode';
  import { ProgressRing, TextBlock } from 'fluent-svelte';
  import { onMount } from 'svelte';
  import { expoOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';
  import type { NavigateFunction } from './types';
  // @ts-expect-error
  import { create_in_transition } from 'svelte/internal';

  let probablyPath = `/poptart/${$page.params.rest}`;
  onMount(() => {
    // hijack history events from the iframe and change the sveltekit route to match
    // so that refreshing the page returns the client to the correct page in the iframe
    if (iframe.contentWindow) {
      const originalPushState = iframe.contentWindow.history.pushState;
      const originalReplaceState = iframe.contentWindow.history.replaceState;

      iframe.contentWindow.history.pushState = function () {
        const args = arguments as unknown as Parameters<typeof originalPushState>;
        const pathname = args[2]?.toString();

        if (pathname) {
          const newProbablyPath = pathname.replace('/strapi', '');
          if (newProbablyPath === '/poptart/') goto('/poptart/cms');
          // originalPushState.apply(this, args);
          if (newProbablyPath.split('?')[0] === probablyPath) {
            goto(newProbablyPath, { replaceState: true });
          } else {
            goto(newProbablyPath);
            animate();
          }
          probablyPath = newProbablyPath;
        }
      };

      iframe.contentWindow.history.replaceState = function () {
        const args = arguments as unknown as Parameters<typeof originalReplaceState>;
        const pathname = args[2]?.toString();

        if (pathname) {
          probablyPath = pathname.replace('/strapi', '');
          // originalReplaceState.apply(this, args);
          goto(probablyPath, { replaceState: true });
        }
      };

      iframe.contentWindow.onpopstate = (evt) => {
        const frameLocation = iframe.contentWindow?.location;

        if (frameLocation) {
          const pathname = frameLocation.href.replace(frameLocation.origin, '');
          probablyPath = pathname.replace('/strapi', '');
        }
      };
    }
  });

  let iframe: HTMLIFrameElement;
  $: if (browser) {
    if (probablyPath.startsWith('/poptart/auth/login')) {
      goto(`/poptart/login?from=${encodeURIComponent($page.url.href)}`);
    }
  }

  // keep the sveltekit route in sync with the iframe
  // (this happens when the iframe navigates to a new page)
  // $: browser && goto(probablyPath);

  // if the sveltekit route changes (and not due to the `goto`
  // above this), navigate the iframe
  afterNavigate(({ to }) => {
    if (
      to?.route.id === '/(admin)/poptart/[...rest]' &&
      to.url.pathname !== probablyPath.split('?')[0]
    ) {
      console.log({ to: to?.url.pathname, probablyPath });
      navigate?.('/' + $page.params.rest, { replace: true });
      animate();
    }
  });

  // react-router `navigate` function from the iframe
  let navigate: NavigateFunction | null = null;

  /**
   * Once the iframe is loaded, listen for the `navigateready` event.
   *
   * The `navigateready` event is dispatched by the iframe when the
   * iframe's react-router `navigate` function is ready to be used.
   *
   * Then, we use the `navigate` function to navigate the iframe
   * to the correct page.
   */
  function handleIframeLoad(
    evt: Event & {
      currentTarget: EventTarget;
    }
  ) {
    (evt.currentTarget as HTMLIFrameElement).contentWindow?.addEventListener(
      'navigateready',
      (evt) => {
        const currentTarget = evt.currentTarget as EventTarget &
          HTMLIFrameElement & { navigate: NavigateFunction | undefined };

        // get the navigate function from the iframe
        navigate = currentTarget.navigate ?? null;

        // navigate from /strapi/poptart/_wait to the actual page
        if ($page.params.rest) {
          navigate?.('/' + $page.params.rest, { replace: true });
          animate();
        }
      }
    );
  }

  $: delay = $motionMode === 'reduced' ? 0 : 130;
  $: duration = $motionMode === 'reduced' ? 0 : 270;

  // trigger a svelte transition on the iframe
  let intro: any;
  function animate() {
    if (intro) intro.end();
    intro = create_in_transition(iframe, fly, { y: 40, duration, easing: expoOut, delay });
    intro.start();
  }
</script>

<div class="wrapper">
  <div class="progress-ring">
    <ProgressRing size={32} />
    <TextBlock variant="bodyStrong">Please wait</TextBlock>
  </div>

  <!-- We start on /strapi/poptart/_wait because matching the src to the current
    pathname or url would cause the iframe to reload -->
  <iframe
    id="content-iframe"
    title="strapi"
    src="/strapi/poptart/_wait"
    bind:this={iframe}
    allowtransparency
    on:load={handleIframeLoad}
  />
</div>

<style>
  .wrapper {
    width: 100%;
    height: 100%;
  }

  iframe {
    border: 0;
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 1;
  }

  .progress-ring {
    display: flex;
    flex-direction: column;
    gap: 14px;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 0;
  }
</style>
