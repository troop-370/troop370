<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  onMount(() => {
    const searchParams = new URLSearchParams($page.url.hash.slice(1));
    const url = new URL($page.url);
    url.search = searchParams.toString();
    fetch(url, { method: 'POST' }).then(async (res) => {
      const redirectTo = await res.text();
      window.location.href = redirectTo;
    });
  });
</script>

Redirecting...
