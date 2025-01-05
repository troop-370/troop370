<script lang="ts">
  import { browser } from '$app/environment';
  import PostTemplate from '$components/Post/PostTemplate.svelte';
  import Paladin2020Template from '$components/Post/paladin2020/Template.svelte';
  import { title } from '$stores/title';

  export let data;

  $: if (browser && data.post) title.set(data.post.name);
</script>

{#if data.post}
  {#if data.post.theme === 'blog'}
    <Paladin2020Template article={data.post} />
  {:else}
    <PostTemplate post={data.post} />
  {/if}
{/if}
