<script lang="ts">
  import Ripple from '@smui/ripple';
  import type { NavigationGroup } from '.';

  export let groups: NavigationGroup[];
</script>

<nav>
  <ul id="main-nav">
    {#each groups as { label, items }}
      <li class="dropdown">
        {#if items.length > 1}
          <span>{label}</span>
          <ul class="dropdown-content">
            {#each items as { path, label }}
              <li><a href={path} use:Ripple={{ surface: true, color: 'primary' }}>{label}</a></li>
            {/each}
          </ul>
        {:else}
          <a href={items[0]?.path} use:Ripple={{ surface: true, color: 'primary' }}>{label}</a>
        {/if}
      </li>
    {/each}
  </ul>
</nav>

<style>
  nav {
    justify-self: end;
  }

  #main-nav {
    list-style-type: none;
    display: inline-flex;
    align-items: center;
    padding: 0;
    margin: 0;
    flex-wrap: wrap;
    height: 56px;
  }

  #main-nav > li {
    display: inline-flex;
  }

  #main-nav > li > span,
  #main-nav > li > a {
    font-family: var(--font-headline);
    color: var(--color-neutral-180);
    text-decoration: none;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 16px;
    padding: 0 15.3px;
    line-height: calc(56px - 10px);
    margin: 5px 0;
    -webkit-tap-highlight-color: transparent;
    will-change: transform, opacity;
    overflow: hidden;
    user-select: none;
  }

  #main-nav > li > a {
    cursor: pointer;
  }

  @media (max-width: 1000px) {
    #main-nav > li > span,
    #main-nav > li > a {
      font-size: 14px;
      padding: 0 10px;
    }
  }

  @media (max-width: 870px) {
    #main-nav > li > span,
    #main-nav > li > a {
      display: none;
    }
  }

  .dropdown > ul {
    display: none;
    position: absolute;
    padding-inline-start: 0;
    margin-top: 50px;
    background: var(--color-neutral-10);
    box-shadow: 0 8px 16px 0 rgb(0 0 0 / 20%);
  }

  .dropdown:hover > ul {
    display: block;
  }

  .dropdown > ul > li {
    display: flex;
  }

  .dropdown > ul > li > a {
    width: 100%;
    padding: 0 11px;
    font-family: var(--font-headline);
    font-size: 16px;
    letter-spacing: 0.5px;
    box-sizing: border-box;
    line-height: calc(56px - 10px);
    margin: 0;
    color: var(--color-neutral-180);
    text-decoration: none;
    text-transform: uppercase;
    font-weight: 700;
  }
</style>
