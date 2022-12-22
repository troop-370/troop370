<script lang="ts">
  import { beforeNavigate } from '$app/navigation';
  import IconButton, { Icon } from '@smui/icon-button';
  import Ripple from '@smui/ripple';
  import type { NavigationGroup } from '.';
  import NavDrawer from './NavDrawer.svelte';
  import NavRow from './NavRow.svelte';

  export let groups: NavigationGroup[];
  export let hideShadow = false;

  let menuOpen = false;

  beforeNavigate(() => {
    menuOpen = false;
  });
</script>

<header class:hideShadow>
  <IconButton class="header-icon-button" on:click={() => (menuOpen = !menuOpen)}>
    <Icon class="material-icons header-icon">menu</Icon>
  </IconButton>
  <a class="wordmark" href="/" use:Ripple={{ surface: true, color: 'primary' }}>BSA Troop 370</a>
  <NavRow groups={groups.filter((group) => group.show_horizontal_nav === true)} />
  <div>
    This is the work-in-progress rewrite of the BSA Troop 370 website.
    <a href="https://troop370atlanta.org">Click here to go to the main version of the website.</a>
  </div>
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
  header.hideShadow {
    box-shadow: none;
  }

  div {
    background-color: var(--color-secondary);
    grid-column-start: 1;
    grid-column-end: 4;
    margin: 0 0 0 -10px;
    width: calc(100% + 30px);
    padding: 4px 20px;
    box-sizing: border-box;
    font-family: var(--font-detail);
    color: var(--color-neutral-10);
  }

  div a {
    color: var(--color-neutral-10);
  }

  @media print {
    header {
      display: none;
    }
  }

  a.wordmark {
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
