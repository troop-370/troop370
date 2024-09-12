<script lang="ts">
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Drawer from '$lib/components/ui/drawer/index.js';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import { mediaQuery } from 'svelte-legos';
  import Ellipsis from './breadcrumb-ellipsis.svelte';
  import Item from './breadcrumb-item.svelte';
  import Link from './breadcrumb-link.svelte';
  import List from './breadcrumb-list.svelte';
  import Page from './breadcrumb-page.svelte';
  import Separator from './breadcrumb-separator.svelte';
  import Root from './breadcrumb.svelte';

  export let items: { href?: string; label: string }[] = [
    { href: '#', label: 'Home' },
    { href: '#', label: 'Documentation' },
    { href: '#', label: 'Building Your Application' },
    { href: '#', label: 'Data Fetching' },
    { label: 'Caching and Revalidating' },
  ];

  const ITEMS_TO_DISPLAY = 4;

  let open = false;

  const isDesktop = mediaQuery('(min-width: 768px)');

  $: lastSectionItems = items.slice(Math.max(-ITEMS_TO_DISPLAY, -items.length) + 1);
</script>

<Root>
  <List>
    <Item>
      {#if items[0].href}
        <Link href={items[0].href}>
          {items[0].label}
        </Link>
      {:else}
        <Page>
          {items[0].label}
        </Page>
      {/if}
    </Item>
    <Separator />
    {#if items.length > ITEMS_TO_DISPLAY}
      <Item>
        {#if $isDesktop}
          <DropdownMenu.Root bind:open>
            <DropdownMenu.Trigger class="flex items-center gap-1" aria-label="Toggle menu">
              <Ellipsis class="h-4 w-4" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="start">
              {#each items.slice(1, -2) as item}
                <DropdownMenu.Item href={item.href ? item.href : '#'}>
                  {item.label}
                </DropdownMenu.Item>
              {/each}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        {:else}
          <Drawer.Root bind:open>
            <Drawer.Trigger aria-label="Toggle Menu">
              <Ellipsis class="h-4 w-4" />
            </Drawer.Trigger>
            <Drawer.Content>
              <Drawer.Header class="text-left">
                <Drawer.Title>Navigate to</Drawer.Title>
                <Drawer.Description>Select a page to navigate to.</Drawer.Description>
              </Drawer.Header>
              <div class="grid gap-1 px-4">
                {#each items.slice(1, -2) as item}
                  <a href={item.href ? item.href : '#'} class="py-1 text-sm">
                    {item.label}
                  </a>
                {/each}
              </div>
              <Drawer.Footer class="pt-4">
                <Drawer.Close asChild let:builder>
                  <Button variant="outline" builders={[builder]}>Close</Button>
                </Drawer.Close>
              </Drawer.Footer>
            </Drawer.Content>
          </Drawer.Root>
        {/if}
      </Item>
      <Separator />
    {/if}

    {#each lastSectionItems as item, index}
      <Item>
        {#if item.href && item.href !== $page.url.pathname}
          <Link href={item.href} class="max-w-20 truncate md:max-w-none">
            {item.label}
          </Link>
        {:else}
          <Page class="max-w-20 truncate md:max-w-none">
            {item.label}
          </Page>
        {/if}
        {#if index < lastSectionItems.length - 1}
          <Separator />
        {/if}
      </Item>
    {/each}
  </List>
</Root>
