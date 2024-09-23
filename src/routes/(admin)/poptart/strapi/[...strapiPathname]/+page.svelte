<script>
  import { page } from '$app/stores';
  import { Button } from 'fluent-svelte';

  $: pathnanme = $page.url.pathname.replace('/poptart', '');
  $: url = new URL(pathnanme + $page.url.search, $page.url.origin);
</script>

<div>
  <p>{url}</p>

  <Button
    on:click={() => {
      window.open(url.href, '_blank');
    }}
  >
    Open in new tab
  </Button>
</div>

<style>
  div {
    padding: 40px;
  }

  p {
    margin: 0;
    margin-bottom: 20px;
  }
</style>
