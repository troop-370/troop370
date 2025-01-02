<script lang="ts">
  import { beforeNavigate } from '$app/navigation';
  import { clearDocumentLoadRerunCache } from './ignoreDocumentLoadReruns';

  // clear the cache when navigating away from the document
  // so that the next time the document is loaded, it will be fresh
  beforeNavigate(({ from, to }) => {
    if (from?.url && from.url.pathname !== to?.url?.pathname) {
      clearDocumentLoadRerunCache();
    }
  });
</script>

<slot />
