import Renderer from '@cristata/prosemirror-to-html-js';
import type { DOMOutputSpec } from '@cristata/prosemirror-to-html-js/dist/Renderer';

interface PullQuoteAttrs {
  position?: string;
}

class PullQuote extends Renderer.Node<PullQuoteAttrs> {
  matching(): boolean {
    return this.node.type === 'pullQuote';
  }
  toDOM(): DOMOutputSpec {
    const position: string = this.node.attrs?.position || 'right';

    return [
      'div',
      { class: `widget pullquote position-${position}` },
      [
        'div',
        {
          style:
            'font-size: 120%; text-align: center; padding: 18px 0; border-top: 2px solid black; border-bottom: 2px solid black;',
        },
        0,
      ],
    ];
  }
}

export { PullQuote };
