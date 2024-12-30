import type { ProsemirrorDocNode } from '@cristata/prosemirror-to-html-js/dist/Renderer';
import { isString } from 'is-what';

export function getPostButtonInfo(bodyContent: ProsemirrorDocNode[]) {
  const buttonTextOverride = (() => {
    if (
      bodyContent &&
      Array.isArray(bodyContent) &&
      bodyContent.length === 1 &&
      bodyContent[0].type === 'paragraph' &&
      Array.isArray(bodyContent[0].content) &&
      bodyContent[0].content.length === 1 &&
      bodyContent[0].content[0].type === 'text'
    ) {
      const text = bodyContent[0].content[0].text?.trim() || '';
      if (text.endsWith('.ob') || text.endsWith('.pb')) {
        return text.replace(/\.ob|\.pb/g, '');
      }
    }
  })();

  const hrefOverride = (() => {
    if (
      bodyContent &&
      Array.isArray(bodyContent) &&
      bodyContent.length === 1 &&
      bodyContent[0].type === 'paragraph' &&
      Array.isArray(bodyContent[0].content) &&
      bodyContent[0].content.length === 1 &&
      bodyContent[0].content[0].type === 'text'
    ) {
      const text = bodyContent[0].content[0].text?.trim() || '';
      if (text.endsWith('.ob') || text.endsWith('.pb')) {
        const href = bodyContent[0].content[0].marks?.find((mark) => mark.type === 'link')?.attrs
          ?.href;
        return isString(href) ? href : undefined;
      }
    }
  })();

  return { buttonTextOverride, hrefOverride };
}
