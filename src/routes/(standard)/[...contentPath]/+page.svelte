<script lang="ts">
  import { ContentPageTemplate } from '$components/ContentPage';
  import { title } from '$stores/title';

  export let data;

  $: title.set(data.page.title);

  $: console.log(data.page.quick_links);
</script>

{#if data.page}
  <ContentPageTemplate data={data.page} authStrings={data.authStrings} />
{/if}
