<script lang="ts">
  import { EmailNewsletter2 } from '$components/EmailNewsletter2';
  import Button, { Label, Icon } from '@smui/button';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ Newsletter } = data);
  $: newsletter = $Newsletter.data?.newsletterPublic;

  let newsletterElement: HTMLHtmlElement;

  let copyLoading = false;
  const getBodyWithInlinedCss = async () => {
    copyLoading = true;

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
    fetch('/newsletters/utils/inline', {
      method: 'POST',
      body: clone.outerHTML,
    })
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
</script>

{#if newsletter}
  <div>
    <Button on:click={() => window.print()} variant="outlined">
      <Icon class="material-icons">printer</Icon>
      <Label>Print email</Label>
    </Button>
    <Button on:click={getBodyWithInlinedCss} variant="outlined">
      {#if copyLoading}
        <Icon class="material-icons">hourglass_top</Icon>
      {:else}
        <Icon class="material-icons">content_copy</Icon>
      {/if}
      <Label>Copy email</Label>
    </Button>
  </div>
  <EmailNewsletter2 {newsletter} bind:element={newsletterElement} />
{/if}

<style>
  div {
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
    div {
      display: none;
    }
  }
</style>
