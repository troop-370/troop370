<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { EmailNewsletter2 } from '$components/EmailNewsletter2';
  import { EmailNewsletter3 } from '$components/EmailNewsletter3';
  import { hasKey } from '$utils';
  import Button, { Icon, Label } from '@smui/button';

  export let data;
  $: newsletter = data.newsletter;

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

  let sendLoading = false;
  const sendEmail = () => {
    sendLoading = true;

    getBodyWithInlinedCss()
      .finally(() => {
        sendLoading = false;
      })
      .then(async (res) => {
        const text = await res.text();
        if (newsletter?.name) sessionStorage.setItem('email.subject', newsletter.name);
        sessionStorage.setItem('email.body', text);
        goto('/email/secure/send');
      });
  };
</script>

{#if newsletter}
  <div>
    <Button on:click={() => window.print()} variant="outlined">
      <Icon class="material-icons">printer</Icon>
      <Label>Print email</Label>
    </Button>
    <Button on:click={copyEmail} variant="outlined">
      {#if copyLoading}
        <Icon class="material-icons">hourglass_top</Icon>
      {:else}
        <Icon class="material-icons">content_copy</Icon>
      {/if}
      <Label>Copy email</Label>
    </Button>
    {#if $page.url.searchParams.get('showSend') === '1'}
      <Button on:click={sendEmail} variant="outlined">
        {#if sendLoading}
          <Icon class="material-icons">hourglass_top</Icon>
        {:else}
          <Icon class="material-icons">send</Icon>
        {/if}
        <Label>Send email</Label>
      </Button>
    {/if}
  </div>
  {#if new Date(newsletter.publishedAt || new Date()) > new Date('2023-01-01')}
    <EmailNewsletter3 {newsletter} bind:element={newsletterElement} />
  {:else}
    <EmailNewsletter2 {newsletter} bind:element={newsletterElement} />
  {/if}
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
