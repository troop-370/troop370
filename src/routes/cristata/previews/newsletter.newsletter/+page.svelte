<script lang="ts">
  import { EmailNewsletter2 } from '$components/EmailNewsletter2';
  import { EmailNewsletter3 } from '$components/EmailNewsletter3';
  import PreviewData from '$components/PreviewData.svelte';
  import PreviewDataCard from '$components/PreviewDataCard.svelte';
  import type { Newsletter$result } from '$houdini';
  import { hasKey } from '$utils';
  import Button, { Icon, Label } from '@smui/button';
  import { z } from 'zod';

  let fields: Record<string, any> = {};

  const validator = z.object({
    documentId: z.string().default(''),
    object_id: z.string().default(''),
    name: z.string().default(''),
    publishedAt: z.string().nullable().default(new Date().toISOString()),
    shortPublishedAt: z.string().nullable().default(new Date().toISOString()),
    version3: z
      .object({
        pinned_mini_posts: z
          .object({
            title: z.string().default(''),
            subtitle: z.string().default(''),
            button_text: z.string().default('Open'),
            slug: z.string().default(''),
          })
          .nullable()
          .array()
          .nullable()
          .default(null),
        announcements: z
          .object({
            title: z.string().default(''),
            subtitle: z.string().default(''),
            body: z.string().default(''),
            category: z.string().array().default([]),
            submitted_by: z.string().default(''),
          })
          .nullable()
          .array()
          .nullable()
          .default(null),
        past_announcements: z
          .object({
            title: z.string().default(''),
            subtitle: z.string().default(''),
            button_text: z.string().default('Open'),
            slug: z.string().default(''),
          })
          .nullable()
          .array()
          .nullable()
          .default(null),
      })
      .nullable()
      .default(null),
    version2: z
      .object({
        pinned_mini_posts: z
          .object({
            title: z.string().default(''),
            subtitle: z.string().default(''),
            button_text: z.string().default('Open'),
            slug: z.string().default(''),
          })
          .nullable()
          .array()
          .nullable()
          .default(null),
        posts: z
          .object({
            title: z.string().default(''),
            subtitle: z.string().default(''),
            body: z.string().default(''),
            category: z.string().array().default([]),
            submitted_by: z.string().default(''),
          })
          .nullable()
          .array()
          .nullable()
          .default(null),
        advancement_mini_posts: z
          .object({
            title: z.string().default(''),
            subtitle: z.string().default(''),
            button_text: z.string().default('Open'),
            slug: z.string().default(''),
          })
          .nullable()
          .array()
          .nullable()
          .default(null),
        fundraiser_mini_posts: z
          .object({
            title: z.string().default(''),
            subtitle: z.string().default(''),
            button_text: z.string().default('Open'),
            slug: z.string().default(''),
          })
          .nullable()
          .array()
          .nullable()
          .default(null),
        camping_mini_posts: z
          .object({
            title: z.string().default(''),
            subtitle: z.string().default(''),
            button_text: z.string().default('Open'),
            slug: z.string().default(''),
          })
          .nullable()
          .array()
          .nullable()
          .default(null),
        service_mini_posts: z
          .object({
            title: z.string().default(''),
            subtitle: z.string().default(''),
            button_text: z.string().default('Open'),
            slug: z.string().default(''),
          })
          .nullable()
          .array()
          .nullable()
          .default(null),
        high_adventure_mini_posts: z
          .object({
            title: z.string().default(''),
            subtitle: z.string().default(''),
            button_text: z.string().default('Open'),
            slug: z.string().default(''),
          })
          .nullable()
          .array()
          .nullable()
          .default(null),
      })
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

  $: data = parsed.success ? parsed.data : null;

  let newsletterElement: HTMLHtmlElement;

  const CSS = {
    isStyleRule: (rule: CSSRule): rule is CSSStyleRule => {
      return hasKey(rule, 'style') && !rule.cssText.includes('@f');
    },
    isMediaRule: (rule: CSSRule): rule is CSSMediaRule => {
      return hasKey(rule, 'media') && hasKey(rule, 'conditionText');
    },
  };

  const getBodyWithInlinedCss = async () => {
    // get all avialable css styles
    let cssText = '';
    Array.from(document.styleSheets).forEach((sheet) => {
      try {
        Array.from(sheet.cssRules).forEach((rule) => {
          const approvedConditions = ['(max-width', '(min-width', 'screen'];
          if (
            CSS.isMediaRule(rule) &&
            approvedConditions.includes(rule.conditionText.split(':')?.[0] || '') &&
            !rule.cssText.includes('#main-nav')
          ) {
            cssText += rule.cssText;
            return;
          }
          if (!CSS.isStyleRule(rule)) return;
          if (rule.selectorText.includes('.mdc-')) return;
          if (rule.selectorText.includes('.smui-')) return;
          if (rule.selectorText.includes('.flickity-')) return;
          if (rule.selectorText.includes('.dropdown.s-')) return;
          if (
            rule.selectorText.includes(':') &&
            !rule.selectorText.includes(':hover') &&
            !rule.selectorText.includes(':active') &&
            !rule.selectorText.includes(':focus') &&
            !rule.selectorText.includes(':focus-visible')
          ) {
            return;
          }

          cssText += rule.cssText;
        });
      } catch (error) {}
    });

    // clone the newsletter document and inject all available css styles
    const clone = newsletterElement.cloneNode(true) as HTMLHtmlElement;
    const styleElem = document.createElement('style');
    styleElem.innerHTML = cssText;
    const headElem = clone.querySelector('head');
    if (headElem) headElem.appendChild(styleElem);
    else clone.appendChild(styleElem);

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

        const doc = document.implementation.createHTMLDocument('email');
        doc.documentElement.innerHTML = text.replaceAll('style=""', '');
        const head = doc.querySelector('head');
        const style = doc.querySelector('style');

        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(style?.innerText || '');
        style?.parentNode?.removeChild(style);

        Array.from(styleSheet.cssRules, (rule) => {
          const newStyleTag = doc.createElement('style');
          newStyleTag.type = 'text/css';
          newStyleTag.textContent = rule.cssText;
          head?.appendChild(newStyleTag);
        });

        if (navigator.clipboard) {
          navigator.clipboard.writeText('<!DOCTYPE html>' + doc.documentElement.outerHTML);
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
        if (data?.name && (data.shortPublishedAt || data.publishedAt)) {
          a.download = data.name + ' – ' + (data.shortPublishedAt || data.publishedAt) + '.html';
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

<PreviewData bind:fields />

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
    <Button
      on:click={() =>
        window.open(
          `/newsletters/${data?.object_id}?showSend=1&hideNav=1`,
          `newsletter-${data?.object_id}`,
          `width=1200,height=850`
        )}
      variant="outlined"
    >
      <Icon class="material-icons">open_in_new</Icon>
      <Label>Open published version</Label>
    </Button>
  </div>
  <div id="cristata-preview-content">
    {#if new Date(data.shortPublishedAt || data.publishedAt || new Date()) > new Date('2023-01-01')}
      <EmailNewsletter3 newsletter={data} bind:element={newsletterElement} />
    {:else}
      <EmailNewsletter2 newsletter={data} bind:element={newsletterElement} />
    {/if}
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
