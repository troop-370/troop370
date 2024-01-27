<script lang="ts">
  import { page } from '$app/stores';
  import Banner from '$components/Banner.svelte';
  import PostCard from '$components/PostCard.svelte';
  import { title } from '$stores/title';
  import { notEmpty } from '$utils';
  import Button from '@smui/button/src/Button.svelte';
  import Ripple from '@smui/ripple';
  import type { PageData } from './$houdini';
  import CategoriesList from './CategoriesList.svelte';

  export let data: PageData;
  $: ({ Posts } = data);

  title.set('Posts');

  let windowWidth = 1200;
</script>

<svelte:window bind:innerWidth={windowWidth} />

<Banner>
  <h1>Posts</h1>
</Banner>

<div class="grid">
  <aside class="top-categories">
    <CategoriesList />
  </aside>
  <div>
    {#if $page.params.category !== 'all'}
      <div class="category-warning">
        Only showing posts from category “{$page.params.category}” |
        <a href="/posts">Show all posts</a>
      </div>
    {/if}
    {#if $Posts.data?.postsPublic?.docs}
      {#each $Posts.data.postsPublic.docs as post}
        {#if post}
          {@const date = post.timestamps ? new Date(post.timestamps.published_at) : undefined}
          {@const datePath = date
            ? `/${date.getUTCFullYear()}/${date.getUTCMonth() + 1}/${date.getUTCDay() + 1}`
            : ''}
          <PostCard
            name={post.name}
            href="/posts{datePath}/{post.slug}"
            authors={(post.submitted_by || []).filter(notEmpty)}
            {date}
            body={post.body}
            buttonText={post.button_text}
            hasPassword={post.enable_password_protection}
            type={post.legacy_markdown ? 'markdown' : 'prosemirror'}
          />
        {/if}
      {/each}
    {/if}
    <div class="nav">
      {#if $Posts.data?.postsPublic?.hasPrevPage}
        <Button
          variant="outlined"
          href="/posts/category/{$page.params.category}/{parseInt($page.params.page) - 1}"
        >
          Previous page
        </Button>
      {/if}
      {#if $Posts.data?.postsPublic?.hasNextPage}
        <Button
          variant="outlined"
          href="/posts/category/{$page.params.category}/{parseInt($page.params.page) + 1}"
        >
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

    <div class="bottom-categories">
      <CategoriesList />
    </div>
    <div>
      <h3>Newsletter Archive</h3>
      <p>
        View previously sent weekly newsletters, which include relevant calendar information,
        alerts, and relevant posts.
      </p>
      <Button variant="outlined" href="/newsletters">View archive</Button>
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
    .bottom-categories {
      display: none;
    }
  }

  @media (min-width: 1001px) {
    aside.top-categories {
      display: none;
    }
  }

  div.nav {
    padding: 0 20px 35px 20px;
    text-align: center;
  }

  aside > div:not(:nth-of-type(2)),
  .category-warning {
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

  .category-warning a {
    color: var(--color-primary);
    box-shadow: 0 1px 0 0 var(--color-primary);
    transition: background-color 0.2s, box-shadow 0.1s, color 0.2s;
    text-decoration: none;
  }
  .category-warning a:hover {
    box-shadow: 0 2px 0 0 var(--color-primary);
    background-color: hsla(var(--color-primary-hsl), 0.1);
    color: var(--color-neutral-200);
  }
  .category-warning a:active {
    background-color: hsla(var(--color-primary-hsl), 0.16);
  }
  .category-warning a:focus-visible {
    box-shadow: 0 0 0 2px var(--color-primary);
  }
</style>
