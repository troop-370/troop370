<script lang="ts">
  import { page } from '$app/stores';
  import Banner from '$components/Banner.svelte';
</script>

<Banner>
  <h1>{$page.status} Error</h1>
  <p>{$page.error.message}</p>
</Banner>
