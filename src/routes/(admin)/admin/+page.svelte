<script>
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { PageTitle } from '$lib/common/PageTitle';
  import TileButton from '$lib/common/TileButton.svelte';
  import { notEmpty } from '$utils';
  import { copy } from 'copy-anything';

  export let data;
  $: ({ apps } = data);
</script>

<PageTitle>Dashboard</PageTitle>

<div class="margin apps">
  {#each ($apps || [])
    .filter(notEmpty)
    .filter(({ label }) => label !== 'Home' && label !== 'Dashboard')
    .map((_item) => {
      const item = copy(_item);
      if (item.label === 'Content manager') {
        item.label = 'Content';
      }
      if (item.label === 'API') item.label = 'Playground';
      if (item.label === 'Configure') item.label = 'Administration';
      if (item.label === 'External accounts') item.label = 'Accounts';
      return item;
    }) as { icon, label, href: to, disabled }}
    <TileButton href={to} {disabled}>
      {label}
      <FluentIcon name={icon} slot="icon" />
    </TileButton>
  {/each}
</div>

<br />

<style>
  .margin {
    margin: 0 auto;
    padding: 0 20px;
    max-width: 1000px;
  }

  .margin-bottom {
    margin-bottom: 30px;
  }

  .apps {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 10px;
  }

  :global(.dashboard-collection-row-expander .expander-content) {
    overflow: auto;
  }
</style>
