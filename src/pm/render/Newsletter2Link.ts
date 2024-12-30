import Renderer from '@cristata/prosemirror-to-html-js';
import type {
  DOMOutputSpec,
  ProsemirrorDocNode,
} from '@cristata/prosemirror-to-html-js/dist/Renderer';

class Newsletter2Link extends Renderer.Mark<{ href: string; class?: string }> {
  name = 'link';

  matching() {
    return this.mark.type === this.name;
  }

  toDOM(node: ProsemirrorDocNode): DOMOutputSpec {
    // outlined button
    if (node.text?.slice(-3) === '.ob') {
      node.text = node.text.slice(0, -3);
      return [
        'a',
        {
          ...this.mark.attrs,
          class: this.mark.attrs?.class || '' + 'email-mdc-button email-mdc-button--outlined',
          style:
            'font-family: roboto, sans-serif; font-size: 13px; font-weight: 700; line-height: 18px; letter-spacing: 0.0892857em; text-decoration: none; text-transform: uppercase; padding: 6px 8px; border: 1px solid rgb(128, 128, 128); color: rgb(0, 63, 135);',
        },
        0,
      ];
    }

    // plain-text button
    if (node.text?.slice(-3) === '.pb') {
      node.text = node.text.slice(0, -3);
      return [
        'a',
        {
          ...this.mark.attrs,
          class: this.mark.attrs?.class || '' + 'email-mdc-button',
          style:
            'font-family: roboto, sans-serif; font-size: 13px; font-weight: 700; line-height: 18px; letter-spacing: 0.0892857em; text-decoration: none; text-transform: uppercase; padding: 6px 8px; border: 0px solid rgb(128, 128, 128); color: rgb(0, 63, 135);',
        },
        0,
      ];
    }

    return ['a', this.mark.attrs || {}, 0];
  }
}

const Mark = Newsletter2Link as typeof Renderer.Mark;
export { Mark as Newsletter2Link };
