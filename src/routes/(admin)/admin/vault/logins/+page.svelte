<script lang="ts">
  import PageTitle from '$lib/common/PageTitle/PageTitle.svelte';
  import { compactMode } from '$stores/compactMode';
  import { TextBlock } from 'fluent-svelte';
  import AccountCard from './AccountCard.svelte';

  export let data;
</script>

<PageTitle fullWidth>Vault » Logins</PageTitle>

<div class="grid" class:compact={$compactMode}>
  {#each data.accounts as account, index}
    <AccountCard {account} {index} />
  {:else}
    <TextBlock>You do have access to any external accounts.</TextBlock>
  {/each}
</div>

<style>
  .grid {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 20px;
    padding: 0 20px 20px 20px;
  }
  .grid.compact {
    gap: 10px;
  }
</style>
