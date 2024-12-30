<script lang="ts">
  import { browser } from '$app/environment';
  import PostTemplate from '$components/Post/PostTemplate.svelte';
  import { title } from '$stores/title';

  export let data;

  $: if (browser && data.post) title.set(data.post.name);
</script>

{#if data.post}
  <PostTemplate post={data.post} />
{/if}
