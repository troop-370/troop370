<script lang="ts">
  import IconButton, { Icon } from '@smui/icon-button';
  import Ripple from '@smui/ripple';
  import type { NavigationGroup } from '.';
  import NavDrawer from './NavDrawer.svelte';
  import NavRow from './NavRow.svelte';

  export let groups: NavigationGroup[];

  let menuOpen = false;
</script>

<header>
  <IconButton class="header-icon-button" on:click={() => (menuOpen = !menuOpen)}>
    <Icon class="material-icons header-icon">menu</Icon>
  </IconButton>
  <a href="/" use:Ripple={{ surface: true, color: 'primary' }}>BSA Troop 370</a>
  <NavRow groups={groups.filter((group) => group.show_horizontal_nav === true)} />
</header>

<NavDrawer bind:open={menuOpen} {groups} />

<style>
  header {
    display: grid;
    grid-template-columns: [menu] 48px [title] 180px [navigation] auto;
    grid-template-rows: 56px;
    padding: 0 20px 0 10px;
    position: sticky;
    top: 0;
    background-color: var(--color-neutral-10);
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 4px 5px 0 rgba(0, 0, 0, 0.07),
      0 1px 10px 0 rgba(0, 0, 0, 0.06);
    align-items: center;
    z-index: 99;
  }

  @media print {
    header {
      display: none;
    }
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
    margin: 5px 0 5px 0;
    padding: 0 10px;
    user-select: none;
  }

  header :global(.header-icon-button) {
    --mdc-ripple-color: var(--color-primary);
  }

  header :global(.header-icon) {
    color: var(--color-primary);
  }
</style>
