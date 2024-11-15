<script lang="ts">
  import { Button, ContentDialog } from 'fluent-svelte';
  import DeveloperDialog from './DeveloperDialog.svelte';

  export let data;

  let developerDialogOpen = false;
</script>

<DeveloperDialog bind:open={developerDialogOpen} {data} />

<Button on:click={() => (developerDialogOpen = true)}>Open Developer Dialog</Button>
