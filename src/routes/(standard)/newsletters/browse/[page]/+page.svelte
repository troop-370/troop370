<script lang="ts">
  import { page } from '$app/stores';
  import Banner from '$components/Banner.svelte';
  import NewsletterCard from '$components/NewsletterCard.svelte';
  import { title } from '$stores/title';
  import Button from '@smui/button/src/Button.svelte';

  export let data;

  title.set('Newsletter Archive');

  let windowWidth = 1200;
</script>

<svelte:window bind:innerWidth={windowWidth} />

<Banner>
  <h1>Newsletter Archive</h1>
</Banner>

<div class="grid">
  <div>
    {#if data.newsletters.docs}
      {#each data.newsletters.docs as newsletter}
        {#if newsletter}
          <NewsletterCard
            name={newsletter.name}
            href="/newsletters/{newsletter._id}"
            date={newsletter.timestamps?.published_at
              ? new Date(newsletter.timestamps.published_at)
              : undefined}
          />
        {/if}
      {/each}
    {/if}
    <div class="nav">
      {#if data.newsletters.hasPrevPage}
        <Button variant="outlined" href="/newsletters/browse/{parseInt($page.params.page) - 1}">
          Previous page
        </Button>
      {/if}
      {#if data.newsletters.hasNextPage}
        <Button variant="outlined" href="/newsletters/browse/{parseInt($page.params.page) + 1}">
          Next page
        </Button>
      {/if}
    </div>
  </div>
  <aside>
    <div>
      <h3>Troop 370 Emails</h3>
      <p>
        Join BSA Troop 370's email list for weekly updates, Eagle Court of Honor announcements,
        merit badge announcements, and other additional notices and opportunities.
      </p>
      <Button variant="outlined" href="/members/communication">Subscribe</Button>
    </div>
    <div>
      <h3>Other Email Archives</h3>
      <p>View past emails that are not weekly newsletters.</p>
      <Button variant="outlined" href="/emails">View archive</Button>
    </div>
    <div>
      <h3>Posts & Updates</h3>
      <p>
        View the individual posts and announcements that are included in the weekly newsletters.
      </p>
      <Button variant="outlined" href="/posts">View posts</Button>
    </div>
  </aside>
</div>

<style>
  div.grid,
  div.nav {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    box-sizing: border-box;
  }

  div.grid {
    padding: 35px 20px 0 20px;
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-column-gap: 10px;
  }

  @media (max-width: 1000px) {
    div.grid {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto 1fr;
    }
  }

  div.nav {
    padding: 0 20px 35px 20px;
    text-align: center;
  }

  aside > div {
    border: 1px solid rgba(0, 0, 0, 0.2);
    padding: 20px;
    margin: 10px 0;
    font-family: var(--font-detail);
    font-size: 1rem;
    line-height: 1.5rem;
    font-weight: 400;
    letter-spacing: 0.03125em;
  }

  aside h3 {
    font-family: var(--font-headline);
    font-size: 1.25rem;
    line-height: 2rem;
    font-weight: 500;
    letter-spacing: 0.0125em;
    text-decoration: inherit;
    text-transform: inherit;
    margin: 5px 0;
    line-height: 1.5;
  }

  aside p {
    margin: 15px 0;
  }
</style>
