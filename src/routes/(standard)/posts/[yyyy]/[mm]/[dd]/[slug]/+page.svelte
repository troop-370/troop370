<script lang="ts">
  import { browser } from '$app/environment';
  import Banner from '$components/Banner.svelte';
  import { title } from '$stores/title';
  import { formatISODate, listOxford, notEmpty } from '$utils';
  import { MDCRipple } from '@material/ripple';
  import { marked } from 'marked';
  import { afterUpdate } from 'svelte';

  export let data;

  $: if (data.post) title.set(data.post.name);

  afterUpdate(() => {
    if (browser && data.post.body) {
      const buttonElems = document.querySelectorAll('.mdc-button');
      buttonElems.forEach((buttonElem) => {
        MDCRipple.attachTo(buttonElem);
      });
    }
  });
</script>

{#if data.post}
  <article>
    <Banner>
      <h1>{@html marked.parseInline(data.post.name)}</h1>
      {#if data.post.description}
        <p>{@html marked.parseInline(data.post.description)}</p>
      {/if}
    </Banner>

    <div id="main-content">
      <p class="meta">
        Posted
        {#if data.post.submitted_by && data.post.submitted_by.filter(notEmpty).length > 0}
          by {listOxford(data.post.submitted_by.filter(notEmpty))}
        {/if}
        {#if data.post.timestamps?.published_at}
          on {formatISODate(data.post.timestamps.published_at, true, true, false)}
        {/if}
      </p>

      {@html data.post.body}
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

  article :global(a:not(.mdc-button)) {
    color: var(--color-primary);
    box-shadow: 0 1px 0 0 var(--color-primary);
    transition: background-color 0.2s, box-shadow 0.1s, color 0.2s;
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
</style>
