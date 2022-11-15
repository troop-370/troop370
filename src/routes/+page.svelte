<script lang="ts">
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ TenantDetails } = data);
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<p>
  GraphQL queries are connected to the {$TenantDetails.data?.tenant?.displayName} tenant on Cristata.
</p>
