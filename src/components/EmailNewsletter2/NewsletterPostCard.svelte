<script lang="ts">
  import { Link } from '$pm/render/Link';
  import Renderer from '@cristata/prosemirror-to-html-js';
  import { marked } from 'marked';
  import { DOMParser } from 'xmldom';
  import { CardTable } from '.';

  export let name: string;
  export let description: string;
  export let body: string;
  export let type: 'markdown' | 'prosemirror';

  let processedHtml = body;
  if (DOMParser) {
    let html: string | undefined = undefined;

    if (type === 'markdown') {
      marked.setOptions(marked.getDefaults());
      html = marked.parse(body);
    }

    if (type === 'prosemirror') {
      const renderer = new Renderer.Renderer();
      renderer.addMark(Link);
      html = renderer.render({
        type: 'doc',
        content: JSON.parse(body),
      });
    }

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
            'margin-top: 0px; font-family: Roboto, sans-serif; font-size: 13px; font-weight: 700; line-height: 18px; letter-spacing: 0.0892857em; text-decoration: none; text-transform: uppercase; padding: 6px 8px; border: 1px solid rgb(128, 128, 128); color: rgb(0, 63, 135); margin-top: 10px; display: inline-flex;'
          );
        }
        if (buttonTypeRegular === true) {
          // only do the following if the anchor includes the text '.b'
          anchors[i].textContent = buttonText.replace('.pb', '');
          anchors[i].setAttribute('class', 'email-mdc-button');
          anchors[i].setAttribute(
            'style',
            'margin-top: 0px; font-family: Roboto, sans-serif; font-size: 13px; font-weight: 700; line-height: 18px; letter-spacing: 0.0892857em; text-decoration: none; text-transform: uppercase; padding: 6px 0px; border: 0px solid rgb(128, 128, 128); color: rgb(0, 63, 135); margin-top: 10px; display: inline-flex;'
          );
        }
      });

      processedHtml = dom.toString() || html || body || '';
    } else {
      processedHtml = html || body || '';
    }
  }
</script>

<CardTable>
  <tr>
    <td>
      <h2>{@html marked.parseInline(name)}</h2>
      <p>{@html marked.parseInline(description)}</p>
      <div>{@html processedHtml}</div>
    </td>
  </tr>
</CardTable>

<style>
  h2 {
    font-family: roboto, sans-serif;
    font-size: 18px;
    line-height: 1.2;
    font-weight: 500;
    letter-spacing: normal;
    margin: 5px 0;
    text-transform: uppercase;
    color: rgb(0, 0, 0) !important;
  }

  p {
    font-family: roboto, sans-serif;
    font-size: 12.5px;
    line-height: 1.35;
    font-weight: 400;
    letter-spacing: normal;
    margin: 2px 0 10px 0;
    opacity: 0.9;
    color: #000000;
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
