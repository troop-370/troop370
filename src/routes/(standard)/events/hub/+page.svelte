<script lang="ts">
  import Banner from '$components/Banner.svelte';
  import Card, { Content, Media, PrimaryAction } from '@smui/card';
  import { z } from 'zod';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ EventsPageConfig } = data);

  const eventCardSchema = z
    .object({
      label: z.string().nullable(),
      caption: z.string().nullable(),
      path: z.string().nullable(),
      photo_src: z.string().optional().nullable(),
    })
    .array();

  $: cards = (() => {
    if ($EventsPageConfig.data?.webConfigPublic?.config) {
      const res = eventCardSchema.safeParse(
        JSON.parse($EventsPageConfig.data.webConfigPublic.config)?.items
      );
      if (res.success) return res.data;
      console.error(res.error);
    }
  })();
</script>

<Banner>
  <h1>Events</h1>
  <p>
    Use the options below to view Troop 370 events. Events and event details can be viewed in one
    place from <a href="/calendar.html">Troop 370's Google Calendar</a>
  </p>
</Banner>

{#if cards}
  <div class="grid">
    {#each cards as card}
      <a href={card.path || './'}>
        <Card>
          <PrimaryAction>
            <img
              alt=""
              src={card.photo_src ||
                'https://troop370atlanta.org/photos/backgrounds/bright-daytime-winter.jpg'}
            />
            <Content>
              <h2>{card.label}</h2>
              <p>{card.caption}</p>
            </Content>
          </PrimaryAction>
        </Card>
      </a>
    {/each}
  </div>
{/if}

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
    grid-gap: 16px;

    padding: 35px 20px;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    box-sizing: border-box;

    font-family: var(--font-detail);
    color: var(--color-neutral-180);
    user-select: none;
  }

  h2 {
    font-family: var(--font-headline);
    margin: 5px 0;
    line-height: 1.5;
    font-weight: 500;
  }

  p {
    margin: 10px 0;
  }

  a {
    text-decoration: none;
    color: inherit;
    height: 100%;
    -webkit-user-drag: none;
  }

  a > :global(.mdc-card),
  a > :global(.mdc-card > .mdc-card__primary-action) {
    height: 100%;
  }

  img {
    height: 200px;
    object-fit: cover;
  }
</style>
