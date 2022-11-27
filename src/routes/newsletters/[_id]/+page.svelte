<script lang="ts">
  import { EmailNewsletter2 } from '$components/EmailNewsletter2';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ Newsletter } = data);
  $: newsletter = $Newsletter.data?.newsletterPublic;
</script>

{#if newsletter}
  <EmailNewsletter2 {newsletter} />
{/if}
