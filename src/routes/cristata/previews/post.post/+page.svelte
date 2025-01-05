<script lang="ts">
  import { page } from '$app/stores';
  import { NewsletterPostCard } from '$components/EmailNewsletter3';
  import Paladin2020Template from '$components/Post/paladin2020/Template.svelte';
  import { parseBody } from '$components/Post/parseBody';
  import PostTemplate from '$components/Post/PostTemplate.svelte';
  import PreviewData from '$components/PreviewData.svelte';
  import PreviewDataCard from '$components/PreviewDataCard.svelte';
  import { PUBLIC_NEW_FILESTORE_PATH, PUBLIC_OLD_FILESTORE_PATH } from '$env/static/public';
  import { notEmpty, withoutImageNodes } from '$utils';
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
      .transform((val) => (val ? val.split(';') : null)),
    title: z.string().default(''),
    theme: z.string().default('post'),
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
    cover_photo: z
      .object({
        url: z.string().nullable().default(null),
        caption: z.string().nullable().default(null),
      })
      .nullable()
      .default(null)
      .transform((val) => {
        return {
          url: val?.url?.replace(
            PUBLIC_OLD_FILESTORE_PATH,
            PUBLIC_NEW_FILESTORE_PATH.replace('https://troop370atlanta.org', $page.url.origin)
          ),
          credit: val?.caption ?? undefined,
        };
      }),
    cover_photo_caption: z.string().nullable().default(null),
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
    {#if data.theme === 'blog'}
      <Paladin2020Template
        article={{
          name: data.title,
          description: data.subtitle,
          body: parseBody(data.body, 'paladin2020'),
          submitted_by: data.submitted_by || [],
          categories: data.category.filter(notEmpty).map(({ label }) => label),
          timestamps: {
            published_at: data.shortPublishedAt || data.publishedAt || new Date().toISOString(),
          },
          slug: data.slug,
          cover_photo: data.cover_photo?.url,
          cover_photo_credit: data.cover_photo?.credit,
          cover_photo_caption: data.cover_photo_caption ?? undefined,
        }}
      />
    {:else}
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
    {/if}
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
{:else if !parsed.success}
  <PreviewDataCard
    label="Error details"
    caption="Something went wrong. Please report this error to the Webmaster."
    data={parsed.error}
  />
{/if}

<PreviewData bind:fields />

<PreviewDataCard data={fields} />
<PreviewDataCard {data} label="Parsed data" />
