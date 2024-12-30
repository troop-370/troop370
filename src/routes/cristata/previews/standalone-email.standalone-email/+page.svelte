<script lang="ts">
  import { StandaloneEmail2 } from '$components/EmailNewsletter2';
  import PreviewData from '$components/PreviewData.svelte';
  import PreviewDataCard from '$components/PreviewDataCard.svelte';
  import Button, { Icon, Label } from '@smui/button';
  import { z } from 'zod';

  let fields: Record<string, any> = {};

  const validator = z.object({
    documentId: z.string().default(''),
    object_id: z.string().default(''),
    name: z.string().default(''),
    header_date: z.string().default(''),
    body: z.string().default('[]'),
    sender_name: z.string().default(''),
  });

  $: parsed = validator.safeParse(fields);

  $: data = parsed.success ? parsed.data : null;

  let emailElement: HTMLHtmlElement;

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

    // clone the email document and inject all available css styles
    const clone = emailElement.cloneNode(true) as HTMLHtmlElement;
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
        if (data?.name && data.header_date) {
          a.download = data.name + ' – ' + data.header_date + '.html';
        } else {
          a.download = 'email-standalone.html';
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
          `/emails/standalone/${data?.object_id}?showSend=1&hideNav=1`,
          `emails-standalone-${data?.object_id}`,
          `width=1200,height=850`
        )}
      variant="outlined"
    >
      <Icon class="material-icons">open_in_new</Icon>
      <Label>Open published version</Label>
    </Button>
  </div>
  <div id="cristata-preview-content">
    <StandaloneEmail2 email={data} bind:element={emailElement} />
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
