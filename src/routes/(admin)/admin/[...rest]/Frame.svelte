<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  let probablyPath = `/admin/${$page.params.rest}`;
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
          probablyPath = pathname.replace('/admin/strapi', '');
          history.replaceState(args[0], args[1], probablyPath);
          originalPushState.apply(this, args);
        }
      };

      iframe.contentWindow.history.replaceState = function () {
        const args = arguments as unknown as Parameters<typeof originalPushState>;
        const pathname = args[2]?.toString();

        if (pathname) {
          probablyPath = pathname.replace('/admin/strapi', '');
          history.replaceState(args[0], args[1], probablyPath);
          originalReplaceState.apply(this, args);
        }
      };

      iframe.contentWindow.onpopstate = (evt) => {
        const frameLocation = iframe.contentWindow?.location;

        if (frameLocation) {
          const pathname = frameLocation.href.replace(frameLocation.origin, '');
          probablyPath = pathname.replace('/admin/strapi', '');
          history.replaceState(null, '', probablyPath);
        }
      };
    }
  });

  let iframe: HTMLIFrameElement;
  $: if (browser) {
    if (probablyPath.startsWith('/admin/auth/login')) {
      goto(`/admin/login?from=${encodeURIComponent($page.url.href)}`);
    }
  }
</script>

<iframe
  id="content-iframe"
  title="strapi"
  src="/admin/strapi{$page.url.pathname}"
  bind:this={iframe}
/>

<style>
  iframe {
    border: 0;
    width: 100%;
    height: 100%;
  }
</style>
