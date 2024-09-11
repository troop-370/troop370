<script lang="ts">
  import NavDrawer from '$components/TopNavigation/NavDrawer.svelte';
  import { Button } from '$lib/components/ui/button';
  import type { NavigationGroup } from '.';
  import Navigation from './navigation.svelte';

  export let navigation: NavigationGroup[];

  let drawerOpen = false;
</script>

<header>
  <div class="header-nav-content">
    <div class="logo">
      <Button variant="ghost" size="icon" on:click={() => (drawerOpen = !drawerOpen)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="currentColor"
          ><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" /></svg
        >
      </Button>

      <Button variant="ghost" size="sm" href="/">BSA Troop 370</Button>
    </div>

    <Navigation {navigation} />
  </div>
</header>

<NavDrawer bind:open={drawerOpen} groups={navigation} />

<style>
  header {
    backdrop-filter: blur(8px);
    background-color: rgba(255, 255, 255, 0.8);
    border-bottom: 1px solid rgba(0, 0, 0, 0.16);
    box-sizing: border-box;
    color: rgb(9, 9, 11);
    color-scheme: light;
    display: block;
    font-feature-settings: normal;
    font-synthesis-weight: none;
    font-variation-settings: normal;
    height: 56px;
    line-height: 24px;
    position: sticky;
    tab-size: 4;
    text-rendering: optimizelegibility;
    text-size-adjust: 100%;
    top: 0px;
    unicode-bidi: isolate;
    z-index: 50;
    -webkit-font-smoothing: antialiased;
    -webkit-tap-highlight-color: rgba(128, 128, 128, 0.5);
  }

  .header-nav-content {
    align-items: center;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    height: 100%;
    justify-content: space-between;
    margin: 0px auto;
    padding: 0px 1rem 0 0.5rem;
    width: 100%;
  }

  .logo {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
  .logo :global(*) {
    font-family: var(--font-headline);
    font-size: 18px;
    font-weight: 500;
  }
</style>
