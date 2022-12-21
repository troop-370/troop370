<script lang="ts">
  import { ContentPageTemplate } from '$components/ContentPage';
  import PreviewData from '$components/PreviewData.svelte';
  import PreviewDataCard from '$components/PreviewDataCard.svelte';
  import type { ContentPage$result } from '$houdini';
  import { z } from 'zod';

  let fields: Record<string, any> = {};

  const validator = z.object({
    _id: z.string().default('000000000000000000000000'),
    name: z.string().default(''),
    body: z.string().default(''),
    dual_columns: z.boolean().default(false),
    alert: z.string().default(''),
    aliases: z.string().nullable().array().default([]),
    enable_password_protection: z.boolean().default(false),
    quick_links: z
      .object({
        label: z.string().nullable(),
        path: z.string().nullable(),
      })
      .array()
      .default([]),
    show_table_of_contents: z.boolean().default(false),
    center_text: z.boolean().default(false),
    timestamps: z
      .object({
        void: z.null().default(null),
      })
      .default({ void: null }),
  });

  $: parsed = validator.safeParse(fields);

  let data: ContentPage$result['contentBySlugPublic'];
  $: data = parsed.success ? parsed.data : null;
</script>

<PreviewData origin="http://localhost:4000/" bind:fields />

{#if data}
  <div id="cristata-preview-content">
    <ContentPageTemplate {data} />
  </div>
{:else if !parsed.success}
  <PreviewDataCard
    label="Error details"
    caption="Something went wrong. Please report this error to the Webmaster."
    data={parsed.error}
  />
{/if}

<PreviewDataCard data={fields} />
<PreviewDataCard {data} label="Parsed data" />
