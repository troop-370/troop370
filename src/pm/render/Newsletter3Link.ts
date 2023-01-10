import Renderer from '@cristata/prosemirror-to-html-js';
import type {
  DOMOutputSpec,
  ProsemirrorDocNode,
} from '@cristata/prosemirror-to-html-js/dist/Renderer';

class Newsletter3Link extends Renderer.Mark<{ href: string; class?: string }> {
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
            'margin-top: 0px; font-family: Roboto, sans-serif; font-size: 12.5px; font-weight: 700; line-height: 18px; letter-spacing: 1.3px; text-decoration: none; text-transform: uppercase; padding: 6px 8px; border: 1px solid #cccccc; color: rgb(0, 63, 135); border-radius: 2px; display: inline-flex;',
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
            'margin-top: 0px; font-family: Roboto, sans-serif; font-size: 12.5px; font-weight: 700; line-height: 18px; letter-spacing: 1.3px; text-decoration: none; text-transform: uppercase; padding: 6px 0px; border: 0px solid #cccccc; color: rgb(0, 63, 135); border-radius: 2px; display: inline-flex;',
        },
        0,
      ];
    }

    return ['a', this.mark.attrs || {}, 0];
  }
}

const Mark = Newsletter3Link as typeof Renderer.Mark;
export { Mark as Newsletter3Link };
