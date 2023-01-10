import Renderer from '@cristata/prosemirror-to-html-js';
import type { DOMOutputSpec } from '@cristata/prosemirror-to-html-js/dist/Renderer';

class HardBreak extends Renderer.Node<Record<string, never>> {
  name = 'hardBreak';

  matching(): boolean {
    return this.node.type === 'hardBreak';
  }

  selfClosing(): boolean {
    return true;
  }

  toDOM(): DOMOutputSpec {
    return ['br', {}];
  }
}

const Node = HardBreak as typeof Renderer.Node;
export { Node as HardBreak };
