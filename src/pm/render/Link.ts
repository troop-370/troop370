import Renderer from '@cristata/prosemirror-to-html-js';
import type {
  DOMOutputSpec,
  ProsemirrorDocNode,
} from '@cristata/prosemirror-to-html-js/dist/Renderer';

class Link extends Renderer.Mark<{ href: string; class?: string }> {
  name = 'link';

  matching() {
    return this.mark.type === this.name;
  }

  toDOM(node: ProsemirrorDocNode): DOMOutputSpec {
    // forced-inverted outlined button (when on dark surface)
    if (node.text?.slice(-4) === '.iob') {
      node.text = node.text.slice(0, -4);
      return [
        'a',
        {
          ...this.mark.attrs,
          class:
            this.mark.attrs?.class ||
            '' + 'mdc-button-outlined--on-primary mdc-button mdc-button--outlined',
        },
        ['span', { class: 'mdc-button__ripple' }],
        ['span', { class: 'mdc-button__label' }, 0],
      ];
    }

    // outlined button
    if (node.text?.slice(-3) === '.ob') {
      node.text = node.text.slice(0, -3);
      return [
        'a',
        {
          ...this.mark.attrs,
          class: this.mark.attrs?.class || '' + 'mdc-button mdc-button--outlined',
        },
        ['span', { class: 'mdc-button__ripple' }],
        ['span', { class: 'mdc-button__label' }, 0],
      ];
    }

    // plain-text button
    if (node.text?.slice(-3) === '.pb') {
      node.text = node.text.slice(0, -3);
      return [
        'a',
        {
          ...this.mark.attrs,
          class: this.mark.attrs?.class || '' + 'mdc-button',
        },
        ['span', { class: 'mdc-button__ripple' }],
        ['span', { class: 'mdc-button__label' }, 0],
      ];
    }

    return ['a', this.mark.attrs || {}, 0];
  }
}

const Mark = Link as typeof Renderer.Mark;
export { Mark as Link };
