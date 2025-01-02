<script lang="ts">
  import { browser } from '$app/environment';
  import { afterNavigate } from '$app/navigation';
  import { title } from '$stores/title';
  import Frame from './Frame.svelte';

  let key = 0;
  afterNavigate(() => {
    // key++;
  });

  $: if (browser) title.set('');
</script>

<div>
  {#key key}
    <Frame />
  {/key}
</div>

<style>
  div {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
</style>
