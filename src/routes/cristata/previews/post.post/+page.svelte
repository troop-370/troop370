<script lang="ts">
  import Banner from '$components/Banner.svelte';
  import { MainTable, NewsletterPostCard } from '$components/EmailNewsletter3';
  import PostCard from '$components/PostCard.svelte';
  import PreviewData from '$components/PreviewData.svelte';
  import PreviewDataCard from '$components/PreviewDataCard.svelte';
  import { HardBreak } from '$pm/render/HardBreak';
  import { Link } from '$pm/render/Link';
  import { formatISODate, listOxford, notEmpty, withoutImageNodes } from '$utils';
  import { isJSON } from '$utils/isJSON';
  import Renderer from '@cristata/prosemirror-to-html-js';
  import Tab, { Label } from '@smui/tab';
  import TabBar from '@smui/tab-bar';
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
    category: z
      .object({
        label: z.string().default(''),
      })
      .nullable()
      .array()
      .default([]),
    tags: z
      .object({
        label: z.string().default(''),
      })
      .nullable()
      .array()
      .default([]),
    subtitle: z.string().default(''),
    publishedAt: z.string().nullable().default(null),
    shortPublishedAt: z.string().nullable().default(null),
  });

  $: parsed = validator.safeParse(fields);

  $: data = parsed.success ? parsed.data : null;

  let bodyHtml = '';
  $: if (data?.body) {
    const renderer = new Renderer.Renderer();
    renderer.addMark(Link);
    renderer.addNode(HardBreak);
    bodyHtml = renderer.render({
      type: 'doc',
      content: isJSON(data.body) ? JSON.parse(data.body) : [],
    });
  }

  let active = 'Website';
</script>

<TabBar
  tabs={['Website', 'Newsletter']}
  bind:active
  let:tab
  style="margin: 0 auto; max-width: 400px;"
>
  <Tab {tab}>
    <Label>{tab}</Label>
  </Tab>
</TabBar>

{#if data}
  {#if active === 'Website'}
    <article>
      <Banner>
        <h1>{@html marked.parseInline(data.title)}</h1>
        <p>{@html marked.parseInline(data.subtitle)}</p>
      </Banner>

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

        {@html bodyHtml}
      </div>
    </article>
  {:else if active === 'Newsletter'}
    <div style="margin: 20px; padding: 0 10px 10px; border: 1px solid lightgray">
      <table>
        <tr>
          <td>
            <NewsletterPostCard
              name={data?.title || ''}
              description={data?.subtitle || ''}
              body={withoutImageNodes(isJSON(data?.body) ? JSON.parse(data.body) : [])}
              number={0}
              category={data?.category?.[0]?.label || ''}
            />
          </td>
        </tr>
      </table>
    </div>
  {/if}
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

  p.meta {
    margin-bottom: 0;
  }
</style>
