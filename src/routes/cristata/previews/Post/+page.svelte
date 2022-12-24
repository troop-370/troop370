<script lang="ts">
  import Banner from '$components/Banner.svelte';
  import PreviewData from '$components/PreviewData.svelte';
  import PreviewDataCard from '$components/PreviewDataCard.svelte';
  import type { Post$result } from '$houdini';
  import { Link } from '$pm/render/Link';
  import { formatISODate, listOxford, Markdown, notEmpty } from '$utils';
  import Renderer from '@cristata/prosemirror-to-html-js';
  import { marked } from 'marked';
  import { z } from 'zod';

  let fields: Record<string, any> = {};

  const validator = z.object({
    slug: z.string().default(''),
    timestamps: z
      .object({
        published_at: z.string().default(new Date('0001-01-01T01:00:00.000+00:00').toISOString()),
      })
      .nullable()
      .default(null),
    submitted_by: z.string().nullable().array().nullable().default(null),
    name: z.string().default(''),
    body: z.string().default('{}'),
    enable_password_protection: z.boolean().default(false),
    legacy_markdown: z.boolean().default(false),
    categories: z.string().nullable().array().default([]),
    tags: z.string().nullable().array().default([]),
    description: z.string().default(''),
  });

  $: parsed = validator.safeParse(fields);

  let data: Post$result['postBySlugPublic'];
  $: data = parsed.success ? parsed.data : null;
  $: {
    if (data?.legacy_markdown === true) {
      try {
        // even though it it markdown, cristata will provide
        // the markdown string in a promsemirror text node, so
        // we need to replace it with the string content
        data = Object.freeze({
          ...data,
          body: JSON.parse(data.body)[0].content[0].text,
        });
      } catch (error) {
        // do nothing if error
      }
    }
  }

  let bodyHtml = '';
  $: {
    if (data?.body) {
      if (data.legacy_markdown) {
        const [, html] = Markdown.parse(data.body);
        bodyHtml = html;
      } else {
        const renderer = new Renderer.Renderer();
        renderer.addMark(Link);
        bodyHtml = renderer.render({
          type: 'doc',
          content: JSON.parse(data.body),
        });
      }
    }
  }
</script>

{#if data}
  <article>
    <Banner>
      <h1>{@html marked.parseInline(data.name)}</h1>
      <p>{@html marked.parseInline(data.description)}</p>
    </Banner>

    <div id="main-content">
      <p class="meta">
        Posted
        {#if data.submitted_by && data.submitted_by.filter(notEmpty).length > 0}
          by {listOxford(data.submitted_by.filter(notEmpty))}
        {/if}
        {#if data.timestamps?.published_at}
          on {formatISODate(data.timestamps.published_at, true, true, false)}
        {/if}
      </p>

      {@html bodyHtml}
    </div>
  </article>
{/if}

<PreviewData bind:fields />

<PreviewDataCard data={fields} />
<PreviewDataCard {data} label="Parsed data" />

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

  p.meta {
    margin-bottom: 0;
  }
</style>
