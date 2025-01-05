<script lang="ts">
  import Banner from '$components/Banner.svelte';
  import PreviewData from '$components/PreviewData.svelte';
  import { formatISODate, listOxford, notEmpty } from '$utils';
  import { marked } from 'marked';
  import Paladin2020 from './Paladin2020.svelte';
  import { validator } from './validator';
  import Warnings from './Warnings.svelte';

  let fields: Record<string, any> = {};

  $: parsed = validator.safeParse(fields);
  $: data = parsed.success ? parsed.data : null;
</script>

{#if data}
  {#if data.theme === 'blog'}
    <Paladin2020 fields={data} />
  {:else}
    <article>
      <Banner>
        <h1>{@html marked.parseInline(data.title)}</h1>
        <p>{@html marked.parseInline(data.subtitle)}</p>
      </Banner>

      <Warnings {data} />

      <div id="main-content">
        <p class="meta">
          Posted
          {#if data.submitted_by && data.submitted_by.filter(notEmpty).length > 0}
            by {listOxford(data.submitted_by.filter(notEmpty))}
          {/if}
          {#if data.shortPublishedAt}
            on {formatISODate(data.shortPublishedAt, true, true, false)}
          {/if}
        </p>
      </div>
    </article>
  {/if}
{/if}

<PreviewData bind:fields />

<style>
  article {
    font-family: var(--font-body);
    line-height: 1.5;
    cursor: default;
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

  #main-content {
    max-width: 768px;
    width: calc(100% - 40px);
    margin: 20px auto 0 auto;
    background: white;
    padding: 68px 88px 0;
    border: 1px solid rgb(171, 171, 171);
    border-bottom: none;
    box-sizing: border-box;
  }

  @media (max-width: 650px) {
    #main-content {
      max-width: unset;
      width: 100%;
      margin: 0 auto;
      padding: 24px 20px 0 20px;
    }
  }

  article {
    background-color: #f3f3f3;
  }
  @media (prefers-color-scheme: dark) {
    article {
      background-color: #202020;
    }
  }

  p.meta {
    margin-bottom: 0;
  }
</style>
