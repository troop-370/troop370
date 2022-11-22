<script lang="ts">
  import Ripple from '@smui/ripple';
  import type { NavigationGroup } from '.';
  import NavRow from './NavRow.svelte';

  export let groups: NavigationGroup[];
</script>

<header>
  <a href="/" use:Ripple={{ surface: true, color: 'primary' }}>BSA Troop 370</a>
  <NavRow {groups} />
</header>

<style>
  header {
    display: grid;
    grid-template-columns: [title] 180px [navigation] auto;
    grid-template-rows: 56px;
    padding: 0 20px;
    position: sticky;
    top: 0;
    background-color: var(--color-neutral-10);
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 4px 5px 0 rgba(0, 0, 0, 0.07),
      0 1px 10px 0 rgba(0, 0, 0, 0.06);
  }

  a {
    justify-self: start;
    display: flex;
    align-items: center;
    font-family: var(--font-headline);
    color: var(--color-primary);
    font-size: 20px;
    font-weight: 500;
    width: fit-content;
    text-decoration: none;
    line-height: calc(56px - 10px);
    margin: 5px 0 5px -10px;
    padding: 0 10px;
    user-select: none;
  }
</style>
