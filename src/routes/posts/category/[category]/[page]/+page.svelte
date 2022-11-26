<script lang="ts">
  import { page } from '$app/stores';
  import Banner from '$components/Banner.svelte';
  import PostCard from '$components/PostCard.svelte';
  import { title } from '$stores/title';
  import { notEmpty } from '$utils';
  import Button from '@smui/button/src/Button.svelte';
  import Ripple from '@smui/ripple';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ Posts } = data);

  title.set('Posts');
</script>

<Banner>
  <h1>Posts</h1>
</Banner>

<div class="grid">
  <div>
    {#if $Posts.data?.postsPublic?.docs}
      {#each $Posts.data.postsPublic.docs as post}
        {#if post}
          <PostCard
            name={post.name}
            href="/posts/{post.slug}"
            authors={(post.submitted_by || []).filter(notEmpty)}
            date={post.timestamps ? new Date(post.timestamps.published_at) : undefined}
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
      <h3>Troop 370 Newsletter</h3>
      <p>
        Sign up for BSA Troop 370's email newsletter for weekly updates, Eagle Court of Honor
        announcements, merit badge announcements, and other additional notices and opportunities
      </p>
      <Button variant="outlined" href="/members/communication">Sign up</Button>
    </div>
    <div>
      <h3>Categories</h3>
      <div class="catlist">
        <a use:Ripple={{ surface: true, color: 'primary' }} href="/posts">all categories</a>
        <a use:Ripple={{ surface: true, color: 'primary' }} href="/posts/category/advancement"
          >advancement</a
        >
        <a use:Ripple={{ surface: true, color: 'primary' }} href="/posts/category/camping"
          >camping</a
        >
        <a use:Ripple={{ surface: true, color: 'primary' }} href="/posts/category/fundraiser"
          >fundraiser</a
        >
        <a use:Ripple={{ surface: true, color: 'primary' }} href="/posts/category/high-adventure"
          >high adventure</a
        >
        <a use:Ripple={{ surface: true, color: 'primary' }} href="/posts/category/meeting"
          >meeting</a
        >
        <a use:Ripple={{ surface: true, color: 'primary' }} href="/posts/category/service"
          >service</a
        >
      </div>
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

  div.nav {
    padding: 0 20px 35px 20px;
    text-align: center;
  }

  aside > div {
    border: 1px solid rgba(0, 0, 0, 0.2);
    padding: 20px;
    margin: 10px 0;
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
    font-family: var(--font-detail);
    font-size: 1rem;
    line-height: 1.5rem;
    font-weight: 400;
    letter-spacing: 0.03125em;
    margin: 15px 0;
  }

  .catlist a {
    margin: 0 -20px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    height: 32px;
    text-transform: lowercase;
    font-family: var(--font-detail);
    font-weight: 500;
    color: var(--color-primary);
    text-decoration: none;
  }
</style>
