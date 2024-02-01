<script lang="ts">
  import { capitalize } from '$utils';
  import { renderBlock, type Node } from 'blocks-html-renderer';
  import { marked } from 'marked';
  import { DOMParser } from 'xmldom';
  import { Number } from '.';

  export let name: string | undefined = undefined;
  export let description: string | undefined = undefined;
  export let body: Node[];
  export let number: number;
  export let category: string;

  let processedHtml = `<code>JSON.stringify(body)</code>`;
  $: {
    if (DOMParser) {
      const html = renderBlock(body);

      if (html) {
        const dom = new DOMParser().parseFromString(html, 'text/html');

        /**
         * Style the buttons in the content,
         */
        const anchors = dom.getElementsByTagName('a') || []; // get all anchors in document
        Array.from(anchors).forEach((anchor, i) => {
          const buttonText = anchor.textContent || ''; // get text of anchor
          const buttonTypeOutlined = buttonText.includes('.ob'); // check if anchor includes the text '.ob'
          const buttonTypeRegular = buttonText.includes('.pb'); // check if anchor includes the text '.b'
          if (buttonTypeOutlined === true) {
            // only do the following if the anchor includes the text '.ob'
            anchors[i].textContent = buttonText.replace('.ob', '');
            anchors[i].setAttribute('class', 'email-mdc-button email-mdc-button--outlined');
            anchors[i].setAttribute(
              'style',
              'margin-top: 0px; font-family: Roboto, sans-serif; font-size: 12.5px; font-weight: 700; line-height: 18px; letter-spacing: 1.3px; text-decoration: none; text-transform: uppercase; padding: 6px 8px; border: 1px solid #cccccc; color: rgb(0, 63, 135); border-radius: 2px; margin-top: 10px; display: inline-flex;'
            );
          }
          if (buttonTypeRegular === true) {
            // only do the following if the anchor includes the text '.pb'
            anchors[i].textContent = buttonText.replace('.pb', '');
            anchors[i].setAttribute('class', 'email-mdc-button');
            anchors[i].setAttribute(
              'style',
              'margin-top: 0px; font-family: Roboto, sans-serif; font-size: 12.5px; font-weight: 700; line-height: 18px; letter-spacing: 1.3px; text-decoration: none; text-transform: uppercase; padding: 6px 0px; border: 0px solid #cccccc; color: rgb(0, 63, 135); border-radius: 2px; margin-top: 10px; display: inline-flex;'
            );
          }
        });

        processedHtml = dom.toString() || html || '';
      } else {
        processedHtml = html || '';
      }
    }
  }
</script>

{#if name}
  <h2>
    <Number {number} {category} />
    <span>{@html marked.parseInline(capitalize(name))}</span>
  </h2>
{/if}
{#if description}
  <p>{@html marked.parseInline(capitalize(description))}</p>
{/if}
<div class="post-content">{@html processedHtml}</div>

<style>
  h2 {
    font-family: roboto, sans-serif;
    font-size: 18px;
    line-height: 1.2;
    font-weight: 500;
    letter-spacing: normal;
    margin: 24px 0 2px 0;
    color: rgb(0, 0, 0) !important;
  }

  span {
    vertical-align: middle;
  }

  p,
  :global(.post-content p) {
    font-family: roboto, sans-serif;
    font-size: 14.5px;
    line-height: 1.35;
    font-weight: 400;
    letter-spacing: normal;
    margin: 2px 0 8px 0;
    opacity: 0.9;
    color: #000000;
  }

  p {
    font-size: 12.5px;
  }

  div {
    font-family: roboto, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    font-weight: 400;
    letter-spacing: 0.03125em;
    color: #000000;
  }
</style>
