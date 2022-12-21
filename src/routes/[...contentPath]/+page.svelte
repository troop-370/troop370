<script lang="ts">
  import { ContentPageTemplate } from '$components/ContentPage';
  import { title } from '$stores/title';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ ContentPage } = data);
  $: pageData = $ContentPage.data?.contentBySlugPublic;

  $: title.set(pageData?.name);
</script>

{#if pageData}
  <ContentPageTemplate data={pageData} />
{:else if $ContentPage.errors}
  Something went wrong
{/if}
