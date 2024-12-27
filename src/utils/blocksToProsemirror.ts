import type { Attrs, MarkType } from '@tiptap/pm/model';
import type { Node as BlockNode } from 'blocks-html-renderer';
import { copy } from 'copy-anything';
import { notEmpty } from './notEmpty';

export function blocksToProsemirror(nodes: BlockNode[] | undefined | null) {
  return (nodes || []).flatMap((node) => blockToProsemirror(node)).filter(notEmpty);
}

type TextInlineNode = Extract<BlockNode['children'][number], { bold?: boolean }>;
type LinkInlineNode = Extract<BlockNode, { type: 'link' }>;

function blockToProsemirror(node: BlockNode | TextInlineNode): any {
  switch (node.type) {
    case 'paragraph':
      return {
        type: 'paragraph',
        content: node.children.flatMap((child) => blockToProsemirror(child)).filter(notEmpty),
      };
    case 'text':
      return processTextNode(node);
    case 'heading':
      return {
        type: 'heading',
        attrs: { level: node.level },
        content: node.children.flatMap((child) => blockToProsemirror(child)).filter(notEmpty),
      };
    case 'quote':
      return {
        type: 'blockquote',
        content: node.children.flatMap((child) => blockToProsemirror(child)).filter(notEmpty),
      };
    case 'code':
      return {
        type: 'codeBlock',
        content: node.children.flatMap((child) => blockToProsemirror(child)).filter(notEmpty),
      };
    // case 'code_block':
    //   return {
    //     type: 'code_block',
    //     content: node.children.flatMap((child) => blockToProsemirror(child)).filter(notEmpty),
    //   };
    case 'list':
      return {
        type: node.format === 'ordered' ? 'orderedList' : 'bulletList',
        content: node.children.flatMap((child) => blockToProsemirror(child)).filter(notEmpty),
      };
    case 'hangingIndent':
      return {
        type: 'paragraph',
        attrs: {
          class: 'hanging',
        },
        content: node.children.flatMap((child) => blockToProsemirror(child)).filter(notEmpty),
      };
    case 'list-item':
      return {
        type: 'listItem',
        content: [
          // prosemirror allows paragraph and list children, but strapi blocks does not supported nested lists
          {
            type: 'paragraph',
            content: node.children.flatMap((child) => blockToProsemirror(child)).filter(notEmpty),
          },
        ],
      };
    // case 'horizontal_rule':
    //   return {
    //     type: 'horizontal_rule',
    //   };
    case 'image':
      return {
        type: 'photoWidget',
        attrs: {
          photoId: node.image.hash,
          photoUrl: node.image.url,
          photoCredit: node.image.caption,
          showCaption: !!node.image.provider_metadata?.showCaption || false,
          position: node.image.provider_metadata?.position || 'center',
          original: copy(node.image),
        },
        children: node.children.flatMap((child) => blockToProsemirror(child)).filter(notEmpty),
      };
    case 'link':
      return processTextNode(node);
  }
}

interface ProsemirrorMark {
  type: MarkType['name'];
  attrs: Attrs;
}

interface ProsemirrorTextNode {
  type: 'text';
  text: string;
  marks: ProsemirrorMark[];
}

function processTextNode(
  node: TextInlineNode | LinkInlineNode,
  manualMarks: ProsemirrorMark[] = []
): ProsemirrorTextNode[] {
  if (node.type === 'link') {
    return node.children
      .filter((child) => child.type === 'text')
      .flatMap((child) =>
        processTextNode(child, [
          {
            type: 'link',
            attrs: {
              href: node.url,
              target: '_self',
              rel: 'noopener noreferrer nofollow',
              class: null,
            },
          },
        ])
      );
  }

  if (!node.text) return []; // empty text nodes are not allowed

  return [
    {
      type: 'text',
      text: node.text,
      marks: [
        node.bold ? { type: 'bold', attrs: {} } : undefined,
        node.code ? { type: 'code', attrs: {} } : undefined,
        node.italic ? { type: 'italic', attrs: {} } : undefined,
        node.underline ? { type: 'underline', attrs: {} } : undefined,
        node.strikethrough ? { type: 'strike', attrs: {} } : undefined,
        ...manualMarks,
      ].filter(notEmpty),
    },
  ];
}
