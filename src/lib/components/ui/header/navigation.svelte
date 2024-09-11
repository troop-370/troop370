<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import type { NavigationGroup } from '.';

  export let navigation: NavigationGroup[];
</script>

<nav>
  {#each navigation.filter(({ show_in_horizontal_nav }) => !!show_in_horizontal_nav) as { label, items }}
    {#if items.length > 1}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild let:builder>
          <Button
            variant="ghost"
            size="sm"
            builders={[builder]}
            class="header-navigation-button"
            style="cursor: default;"
          >
            {label}
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Group>
            {#each items as { path, label }}
              <DropdownMenu.Item style="padding-top: 0; padding-bottom: 0;">
                <a href={path}>{label}</a>
              </DropdownMenu.Item>
            {/each}
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    {:else}
      <Button variant="ghost" size="sm" href={items[0].path} class="header-navigation-button">
        {label}
      </Button>
    {/if}
  {/each}
</nav>

<style>
  nav {
    display: flex;
    align-items: center;
  }

  @media (max-width: 800px) {
    nav {
      display: none;
    }
  }

  a {
    display: block;
    width: 100%;
    padding-top: 0.375rem;
    padding-bottom: 0.375rem;
    -webkit-user-drag: none;
  }

  nav :global(.header-navigation-button) {
    font-weight: 400;
    font-size: 0.875rem;
  }
</style>
