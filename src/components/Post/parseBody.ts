import { HardBreak } from '$pm/render/HardBreak';
import { Link } from '$pm/render/Link';
import { PhotoWidget } from '$pm/render/PhotoWidget';
import { PullQuote } from '$pm/render/PullQuote';
import { Renderer } from '@cristata/prosemirror-to-html-js';
import { DOMParser } from 'xmldom';

export function parseBody(body = '', theme: 'default' | 'paladin2020' = 'default') {
  if (!body) return '';

  const renderer = new Renderer();
  renderer.addNode(HardBreak);
  renderer.addMark(Link);

  if (theme === 'paladin2020') {
    renderer.addNode(PhotoWidget);
    renderer.addNode(PullQuote);
  }

  const html = renderer.render({
    type: 'doc',
    content: JSON.parse(body),
  });

  if (DOMParser && html) {
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
        anchors[i].setAttribute('class', 'mdc-button mdc-button--outlined');
      }
      if (buttonTypeRegular === true) {
        // only do the following if the anchor includes the text '.b'
        anchors[i].textContent = buttonText.replace('.pb', '');
        anchors[i].setAttribute('class', 'mdc-button');
      }
    });

    return dom.toString() || html || '';
  }

  return html || JSON.stringify(body || '') || '';
}
