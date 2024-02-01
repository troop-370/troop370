import type { ProsemirrorDocNode } from '@cristata/prosemirror-to-html-js/dist/Renderer';
import type { Node } from 'blocks-html-renderer';
import { notEmpty } from './notEmpty';

export function tiptapToStrapi(json: ProsemirrorDocNode[]) {
  const converted = json.flatMap(convertProsemirrorToBlock).filter(notEmpty).filter(isBlock);
  return converted;
}

function isBlock(block: {}): block is Node {
  return !!block && JSON.stringify(block) !== JSON.stringify({});
}

/**
 * THIS IS NOT FEATURE COMPLETE!
 * It only accounts for the nodes and marks that were enabled on the posts
 * collection in Cristata.
 */
function convertProsemirrorToBlock(node: ProsemirrorDocNode): {}[] {
  if (node.type == 'hardBreak') {
    return [{ type: 'text', text: '\n' }];
  }

  if (node.type === 'heading') {
    return [
      {
        type: 'heading',
        level: node.attrs?.level || 1,
        children: node.content?.flatMap(convertProsemirrorToBlock).filter(notEmpty) || [],
      },
    ];
  }

  if (node.type === 'paragraph') {
    return [
      {
        type: 'paragraph',
        children: node.content?.flatMap(convertProsemirrorToBlock).filter(notEmpty) || [],
      },
    ];
  }

  if (node.type === 'text') {
    if (node.marks?.map((mark) => mark.type).includes('link')) {
      const markIndex = node.marks.findIndex((mark) => mark.type === 'link');
      const mark = node.marks[markIndex];

      return [
        {
          type: 'link',
          url: mark?.attrs?.href,
          children:
            convertProsemirrorToBlock({
              ...node,
              marks: [...node.marks.slice(0, markIndex), ...node.marks.slice(markIndex + 1)],
            }) || [],
        },
      ];
    }

    return [
      {
        type: 'text',
        text: node.text,
        bold: node.marks?.map((mark) => mark.type).includes('bold') ? true : undefined,
        italic: node.marks?.map((mark) => mark.type).includes('italic') ? true : undefined,
        strikethrough: node.marks?.map((mark) => mark.type).includes('strike') ? true : undefined,
      },
    ];
  }

  if (node.type === 'blockquote') {
    return (
      node.content
        ?.flatMap(convertProsemirrorToBlock)
        .filter(notEmpty)
        .filter(isBlock)
        .map((node) => ({ type: 'quote', children: node.children })) || []
    );
  }

  if (node.type === 'codeBlock') {
    return [
      {
        type: 'code',
        children: node.content?.flatMap(convertProsemirrorToBlock).filter(notEmpty) || [],
      },
    ];
  }

  if (node.type === 'orderedList') {
    return [
      {
        type: 'list',
        format: 'ordered',
        children: node.content?.flatMap(convertProsemirrorToBlock).filter(notEmpty) || [],
      },
    ];
  }

  if (node.type === 'bulletList') {
    return [
      {
        type: 'list',
        format: 'unordered',
        children: node.content?.flatMap(convertProsemirrorToBlock).filter(notEmpty) || [],
      },
    ];
  }

  if (node.type === 'listItem') {
    return [
      {
        type: 'list-item',
        children:
          node.content?.flatMap(convertProsemirrorToBlock).filter(notEmpty).filter(isBlock)[0]
            ?.children || [],
      },
    ];
  }

  return [{}];
}
