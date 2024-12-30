<script lang="ts">
  import { browser } from '$app/environment';
  import Banner from '$components/Banner.svelte';
  import { title } from '$stores/title';
  import { formatISODate, listOxford, notEmpty } from '$utils';
  import { MDCRipple } from '@material/ripple';
  import { marked } from 'marked';
  import { afterUpdate } from 'svelte';

  export let post: {
    name: string;
    description?: string;
    body: string;
    submitted_by?: string[];
    timestamps?: {
      published_at?: string;
    };
  };

  afterUpdate(() => {
    if (browser && post.body) {
      const buttonElems = document.querySelectorAll('.mdc-button');
      buttonElems.forEach((buttonElem) => {
        MDCRipple.attachTo(buttonElem);
      });
    }
  });
</script>

<article>
  <Banner>
    <h1>{@html marked.parseInline(post.name)}</h1>
    {#if post.description}
      <p>{@html marked.parseInline(post.description)}</p>
    {/if}
  </Banner>

  <div id="main-content">
    <p class="meta">
      Posted
      {#if post.submitted_by && post.submitted_by.filter(notEmpty).length > 0}
        by {listOxford(post.submitted_by.filter(notEmpty))}
      {/if}
      {#if post.timestamps?.published_at}
        on {formatISODate(post.timestamps.published_at, true, true, false)}
      {/if}
    </p>

    {@html post.body}
  </div>
</article>

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
    margin-bottom: 0;
  }

  #main-content {
    width: 100%;
    max-width: 800px;
    padding: 20px;
    box-sizing: border-box;
    margin: 0 auto;
  }

  article :global(p) {
    margin-top: 0;
  }

  article :global(h2) {
    font-family: var(--font-headline);
    font-size: 1.5rem;
    font-weight: 500;
    letter-spacing: normal;
    padding-top: 0.7em;
    margin-top: 0;
    margin-bottom: 0.7em;
  }

  article :global(h3) {
    font-family: var(--font-headline);
    font-size: 1.25rem;
    font-weight: 500;
    letter-spacing: 0.0125em;
    padding-top: 1.2em;
    margin-top: 0;
    margin-bottom: 0.7em;
  }

  article :global(a:not(.mdc-button)) {
    color: var(--color-primary);
    box-shadow: 0 1px 0 0 var(--color-primary);
    transition:
      background-color 0.2s,
      box-shadow 0.1s,
      color 0.2s;
    text-decoration: none;
  }
  article :global(a:hover:not(.mdc-button)) {
    box-shadow: 0 2px 0 0 var(--color-primary);
    background-color: hsla(var(--color-primary-hsl), 0.1);
    color: var(--color-neutral-160);
  }
  article :global(a:active:not(.mdc-button)) {
    background-color: hsla(var(--color-primary-hsl), 0.16);
  }
  article :global(a:focus-visible:not(.mdc-button)) {
    box-shadow: 0 0 0 2px var(--color-primary);
  }

  article :global(img) {
    width: 100%;
  }

  article :global(li p) {
    margin: 0;
  }
  article :global(p + ul),
  article :global(p + ol) {
    margin-top: calc(-1em + 4px);
    padding-inline-start: 28px;
  }
</style>
