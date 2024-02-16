<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import Frame from './Frame.svelte';

  export let data;

  let key = 0;
  afterNavigate(() => {
    key++;
  });
</script>

<div>
  {#key key}
    <Frame {data} />
  {/key}
</div>

<style>
  div {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
</style>
