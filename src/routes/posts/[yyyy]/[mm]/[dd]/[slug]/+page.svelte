<script lang="ts">
  import { browser } from '$app/environment';
  import Banner from '$components/Banner.svelte';
  import { title } from '$stores/title';
  import { formatISODate, listOxford, Markdown, notEmpty } from '$utils';
  import Renderer from '@cristata/prosemirror-to-html-js';
  import { MDCRipple } from '@material/ripple';
  import { afterUpdate } from 'svelte';
  import type { PageData } from './$houdini';

  const renderer = new Renderer.Renderer();

  export let data: PageData;
  $: ({ Post } = data);
  $: post = $Post.data?.postBySlugPublic;

  $: {
    if (post) title.set(post.name);
  }

  let bodyHtml = '';
  $: {
    if (post) {
      if (post.legacy_markdown) {
        const [, html] = Markdown.parse(post.body);
        bodyHtml = html;
      } else {
        bodyHtml = renderer.render({
          type: 'doc',
          content: JSON.parse(post.body),
        });
      }
    }
  }

  afterUpdate(() => {
    if (browser && bodyHtml) {
      const buttonElems = document.querySelectorAll('.mdc-button');
      buttonElems.forEach((buttonElem) => {
        MDCRipple.attachTo(buttonElem);
      });
    }
  });
</script>

{#if post}
  <article>
    <Banner>
      <h1>{post.name}</h1>
      <p>{post.description}</p>
    </Banner>

    <div id="main-content">
      <p class="meta">
        Posted by {listOxford((post.submitted_by || []).filter(notEmpty))}
        {#if post.timestamps?.published_at}
          on {formatISODate(post.timestamps.published_at, true, true, false)}
        {/if}
      </p>

      {@html bodyHtml}
    </div>
  </article>
{/if}

<style>
  article {
    font-family: var(--font-body);
    line-height: 1.5;
  }

  p.meta {
    font-style: italic;
    font-size: 15px;
    padding: 5px 0 20px 0;
    text-align: center;
  }

  #main-content {
    width: 100%;
    max-width: 800px;
    padding: 20px;
    box-sizing: border-box;
    margin: 0 auto;
  }

  article :global(h2) {
    font-family: var(--font-headline);
    font-size: 1.5rem;
    font-weight: 500;
    letter-spacing: normal;
    margin-top: 0.7em;
    margin-bottom: 0.7em;
  }
</style>
