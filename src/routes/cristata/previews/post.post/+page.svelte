<script lang="ts">
  import { NewsletterPostCard } from '$components/EmailNewsletter3';
  import { parseBody } from '$components/Post/parseBody';
  import PostTemplate from '$components/Post/PostTemplate.svelte';
  import PreviewData from '$components/PreviewData.svelte';
  import PreviewDataCard from '$components/PreviewDataCard.svelte';
  import { withoutImageNodes } from '$utils';
  import { isJSON } from '$utils/isJSON';
  import Tab, { Label } from '@smui/tab';
  import TabBar from '@smui/tab-bar';
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
    <PostTemplate
      post={{
        name: data.title,
        description: data.subtitle,
        body: parseBody(data.body),
        submitted_by: data.submitted_by || [],
        timestamps: {
          published_at: data.shortPublishedAt || data.publishedAt || new Date().toISOString(),
        },
      }}
    />
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
