<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { ProgressRing, TextBlock } from 'fluent-svelte';
  import { onMount } from 'svelte';
  ('svelte');

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
          probablyPath = pathname.replace('/strapi', '');
          if (probablyPath === '/poptart/') goto('/poptart/cms');
          history.replaceState(args[0], args[1], probablyPath);
          originalPushState.apply(this, args);
        }
      };

      iframe.contentWindow.history.replaceState = function () {
        const args = arguments as unknown as Parameters<typeof originalPushState>;
        const pathname = args[2]?.toString();

        if (pathname) {
          probablyPath = pathname.replace('/strapi', '');
          history.replaceState(args[0], args[1], probablyPath);
          originalReplaceState.apply(this, args);
        }
      };

      iframe.contentWindow.onpopstate = (evt) => {
        const frameLocation = iframe.contentWindow?.location;

        if (frameLocation) {
          const pathname = frameLocation.href.replace(frameLocation.origin, '');
          probablyPath = pathname.replace('/strapi', '');
          history.replaceState(null, '', probablyPath);
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
</script>

<div class="wrapper">
  <div class="progress-ring">
    <ProgressRing size={32} />
    <TextBlock variant="bodyStrong">Please wait</TextBlock>
  </div>

  <iframe
    id="content-iframe"
    title="strapi"
    src="/strapi{$page.url.pathname.replace('/poptart', '/poptart')}"
    bind:this={iframe}
    allowtransparency
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
