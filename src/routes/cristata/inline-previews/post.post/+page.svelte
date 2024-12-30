<script lang="ts">
  import Banner from '$components/Banner.svelte';
  import PreviewData from '$components/PreviewData.svelte';
  import { formatISODate, listOxford, notEmpty } from '$utils';
  import { marked } from 'marked';
  import { z } from 'zod';

  let fields: Record<string, any> = {};

  const validator = z.object({
    slug: z.string().default(''),
    submitted_by: z
      .string()
      .nullable()
      .default(null)
      .transform((val) => (val ? val.split(',') : null)),
    title: z.string().default(''),
    body: z.string().default(''),
    enable_password_protection: z.boolean().default(false),
    categories: z.string().nullable().array().default([]),
    tags: z.string().nullable().array().default([]),
    subtitle: z.string().default(''),
    publishedAt: z.string().nullable().default(null),
    shortPublishedAt: z.string().nullable().default(null),
  });

  $: parsed = validator.safeParse(fields);

  $: data = parsed.success ? parsed.data : null;
</script>

{#if data}
  <article>
    <Banner>
      <h1>{@html marked.parseInline(data.title)}</h1>
      <p>{@html marked.parseInline(data.subtitle)}</p>
    </Banner>

    {#if !data.submitted_by || data.submitted_by.filter(notEmpty).length === 0}
      <div class="warning">
        WARNING! You have not specified the first and last name of the person who submitted this
        post. Please add them via the <span style="font-weight: 500;">Submitted by</span> field.
      </div>
    {/if}
    {#if !data.categories || data.categories.filter(notEmpty).length === 0}
      <div class="warning">
        WARNING! You have not specified a category for this post. Please add one via the
        <span style="font-weight: 500;">Category</span> field.
      </div>
    {/if}
    {#if !data.enable_password_protection && data.body.match(/[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/)}
      <div class="warning light">
        It looks like you have included an email address in the body of this post. If it is a
        personal email address, consider enabling the
        <span style="font-weight: 500;">Enable password protection</span>
        option to prevent this email from being visible to the public and bots.
      </div>
    {/if}
    {#if !data.enable_password_protection && data.body.match(/(\+?\d{1,2}\s?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)}
      <div class="warning light">
        It looks like you have included a phone number in the body of this post. If it is a personal
        phone number, consider enabling the
        <span style="font-weight: 500;">Enable password protection</span>
        option to prevent this phone number from being visible to the public and bots.
      </div>
    {/if}

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

  div.warning {
    background-color: var(--color-secondary);
    grid-column-start: 1;
    grid-column-end: 4;
    margin: 0 0 0 -10px;
    width: calc(100% + 30px);
    padding: 4px 20px;
    box-sizing: border-box;
    font-family: var(--font-detail);
    color: var(--color-neutral-10);
  }

  div.warning.light {
    background-color: color-mix(in srgb, black 20%, var(--color-primary) 100%);
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
