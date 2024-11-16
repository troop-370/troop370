<script lang="ts">
  import { copy } from 'copy-anything';
  import { Button } from 'fluent-svelte';
  import DeveloperDialog from './DeveloperDialog.svelte';
  import Fields from './Fields.svelte';

  export let data;
  $: ({ collectionConfig } = data);
  $: docData = copy(data.docData) as Record<string, unknown>;
  let sessionAdminToken = data.session.adminToken;

  let developerDialogOpen = false;

  const systemFields = ['id', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy'];
  $: visibleFieldDefs = $collectionConfig.defs.filter(
    ([key, def]) => def.order < Infinity && !systemFields.includes(key)
  );
  $: hiddenFieldDefs = $collectionConfig.defs.filter(
    ([key, def]) => def.order === Infinity && !systemFields.includes(key)
  );
</script>

<DeveloperDialog bind:open={developerDialogOpen} {data} />

<Button on:click={() => (developerDialogOpen = true)}>Open Developer Dialog</Button>

<article>
  <Fields defs={visibleFieldDefs} {docData} {sessionAdminToken} />

  <hr />

  <Fields defs={hiddenFieldDefs} {docData} {sessionAdminToken} />
</article>

<style>
  article {
    max-width: 800px;
    margin: 0 auto;
  }
</style>
