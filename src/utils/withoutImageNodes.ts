import type { ProsemirrorDocNode } from '@cristata/prosemirror-to-html-js/dist/Renderer';
import { hasKey } from './hasKey';

/**
 * Returns a copy of the input prosemirror doc nodes without image nodes.
 *
 * Note: This will recursively search for image nodes and exclude them.
 */
export function withoutImageNodes(nodes: ProsemirrorDocNode[]): ProsemirrorDocNode[] {
  return nodes.filter(removeImageNode).map((node) => {
    return {
      ...node,
      children: hasKey(node, 'content') ? withoutImageNodes(node.content) : [],
    };
  });
}

function removeImageNode(node: { type: string }) {
  if (node.type === 'image') {
    return false;
  }
  return true;
}
