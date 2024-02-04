import type { Node as BlocksNode } from 'blocks-html-renderer';
import { hasKey } from './hasKey';

/**
 * Returns a copy of the input blocks nodes without image nodes.
 *
 * Note: This will recursively search for image nodes and exclude them.
 */
export function withoutImageNodes(nodes: BlocksNode[]): BlocksNode[] {
  // @ts-expect-error typescript is being dumb here
  return nodes.filter(removeImageNode).map((node) => {
    return {
      ...node,
      // @ts-expect-error typescript is being dumb here
      children: hasKey(node, 'children') ? withoutImageNodes(node.children) : [],
    };
  });
}

function removeImageNode(node: { type: string }) {
  if (node.type === 'image') {
    return false;
  }
  return true;
}
