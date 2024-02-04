<script lang="ts">
  import { ContentPageTemplate } from '$components/ContentPage';
  import { title } from '$stores/title';

  export let data;

  $: title.set(data.page.title);
</script>

{#if data.page}
  <ContentPageTemplate data={data.page} authStrings={data.authStrings} />
{/if}
