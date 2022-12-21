<script lang="ts">
  import { ContentPageTemplate } from '$components/ContentPage';
  import { EmailNewsletter2 } from '$components/EmailNewsletter2';
  import PreviewData from '$components/PreviewData.svelte';
  import PreviewDataCard from '$components/PreviewDataCard.svelte';
  import type { ContentPage$result, Newsletter$result } from '$houdini';
  import Button, { Icon, Label } from '@smui/button';
  import { z } from 'zod';

  let fields: Record<string, any> = {};

  const validator = z.object({
    _id: z.string().default(''),
    name: z.string().default(''),
    newsletter_date: z.string().nullable().default(null),
    announcements: z
      .object({
        name: z.string().default(''),
        description: z.string().default(''),
        body: z.string().default(''),
        legacy_markdown: z.boolean().default(false),
      })
      .nullable()
      .array()
      .nullable()
      .default(null),
    advancement_mini_posts: z
      .object({
        slug: z.string().default(''),
        name: z.string().default(''),
        description: z.string().default(''),
        button_text: z.string().default('Read more'),
      })
      .nullable()
      .array()
      .nullable()
      .default(null),
    fundraiser_mini_posts: z
      .object({
        slug: z.string().default(''),
        name: z.string().default(''),
        description: z.string().default(''),
        button_text: z.string().default('Read more'),
      })
      .nullable()
      .array()
      .nullable()
      .default(null),
    camping_mini_posts: z
      .object({
        slug: z.string().default(''),
        name: z.string().default(''),
        description: z.string().default(''),
        button_text: z.string().default('Read more'),
      })
      .nullable()
      .array()
      .nullable()
      .default(null),
    service_mini_posts: z
      .object({
        slug: z.string().default(''),
        name: z.string().default(''),
        description: z.string().default(''),
        button_text: z.string().default('Read more'),
      })
      .nullable()
      .array()
      .nullable()
      .default(null),
    high_adventure_mini_posts: z
      .object({
        slug: z.string().default(''),
        name: z.string().default(''),
        description: z.string().default(''),
        button_text: z.string().default('Read more'),
      })
      .nullable()
      .array()
      .nullable()
      .default(null),
    pinned_mini_posts: z
      .object({
        slug: z.string().default(''),
        name: z.string().default(''),
        description: z.string().default(''),
        button_text: z.string().default('Read more'),
      })
      .nullable()
      .array()
      .nullable()
      .default(null),
    manual_calendar: z
      .object({
        month: z.string().nullable().default(null),
        events: z.string().nullable().default(null),
      })
      .nullable()
      .array()
      .nullable()
      .default(null),
  });

  $: parsed = validator.safeParse(fields);

  let data: Newsletter$result['newsletterPublic'] & ({ _id: string } | null);
  $: data = parsed.success ? parsed.data : null;

  let newsletterElement: HTMLHtmlElement;

  const getBodyWithInlinedCss = async () => {
    // get all avialable css styles
    let cssText = '';
    Array.from(document.styleSheets).forEach((sheet) => {
      try {
        Array.from(sheet.cssRules).forEach((rule) => {
          cssText += rule.cssText;
        });
      } catch (error) {}
    });

    // clone the newsletter document and inject all available css styles
    const clone = newsletterElement.cloneNode(true) as HTMLHtmlElement;
    const styleElem = document.createElement('style');
    styleElem.innerHTML = cssText;
    clone.appendChild(styleElem);

    // get the html string with inlined css
    return fetch('/newsletters/utils/inline', {
      method: 'POST',
      body: clone.outerHTML,
    });
  };

  let copyLoading = false;
  const copyEmail = () => {
    copyLoading = true;

    getBodyWithInlinedCss()
      .finally(() => {
        copyLoading = false;
      })
      .then(async (res) => {
        const text = await res.text();
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text);
        }
      });
  };

  let downloadLoading = false;
  const downloadEmail = () => {
    downloadLoading = true;

    getBodyWithInlinedCss()
      .finally(() => {
        downloadLoading = false;
      })
      .then(async (res) => {
        const text = await res.text();

        // create blob
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });

        // download
        const url = window.URL || window.webkitURL;
        const link = url.createObjectURL(blob);
        const a = document.createElement('a');
        if (data?.name && data.newsletter_date) {
          a.download = data.name + ' – ' + data.newsletter_date + '.html';
        } else {
          a.download = 'newsletter.html';
        }
        a.href = link;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
  };
</script>

<PreviewData origin="http://localhost:4000/" bind:fields />

{#if data}
  <div id="actions-row">
    <Button on:click={copyEmail} variant="outlined">
      {#if copyLoading}
        <Icon class="material-icons">hourglass_top</Icon>
      {:else}
        <Icon class="material-icons">content_copy</Icon>
      {/if}
      <Label>Copy email</Label>
    </Button>
    <Button on:click={downloadEmail} variant="outlined">
      {#if downloadLoading}
        <Icon class="material-icons">hourglass_top</Icon>
      {:else}
        <Icon class="material-icons">download</Icon>
      {/if}
      <Label>Download email</Label>
    </Button>
    <Button on:click={() => window.open(`/newsletters/${data?._id}`)} variant="outlined">
      <Icon class="material-icons">open_in_new</Icon>
      <Label>Open published version</Label>
    </Button>
  </div>
  <div id="cristata-preview-content">
    <EmailNewsletter2 newsletter={data} bind:element={newsletterElement} />
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

<style>
  #actions-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 5px;
    padding: 10px 5px 5px 5px;
    max-width: 640px;
    margin: 0 auto;
    box-sizing: border-box;
  }

  @media print {
    #actions-row {
      display: none;
    }
  }
</style>
