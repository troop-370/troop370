<script lang="ts">
  import { page } from '$app/stores';
  import { Button, ContentDialog } from 'fluent-svelte';

  let data: { errorCode?: string; errorMessage?: string } = {};
  $: data = JSON.parse($page.url.searchParams.get('data') || '{}');
</script>

<ContentDialog open title="Store unavailable" closable={false}>
  {#if data.errorCode === 'NOT_AVAILABLE_ON_CURRENT_PLAN'}
    The store admin panel is currently disabled because the premium plan is not active. <br /><br />
    If you believe the store should be active, contact the Webmaster.
  {/if}

  <svelte:fragment slot="footer">
    <Button slot="footer" href="/admin">Return to dashboard</Button>
  </svelte:fragment>
</ContentDialog>
