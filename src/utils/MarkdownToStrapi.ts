import type { Node } from 'blocks-html-renderer';
import { Renderer, marked } from 'marked';
import { notEmpty } from './notEmpty';

class MarkDown {
  #options: marked.MarkedOptions = {
    baseUrl: undefined,
    breaks: false,
    gfm: true,
    headerIds: true,
    headerPrefix: '',
    highlight: undefined,
    langPrefix: 'language-',
    mangle: true,
    pedantic: false,
    sanitize: false,
    sanitizer: undefined,
    silent: false,
    smartLists: false,
    smartypants: false,
    tokenizer: undefined,
    walkTokens: undefined,
    xhtml: true,
  };

  configure() {
    marked.setOptions(this.#options);
    const renderer = new Renderer();
    marked.use({ renderer: renderer });
  }

  parse(md: string) {
    this.configure();
    const tokens = marked.lexer(md);
    const converted = tokens.flatMap(convertToBlock).filter(notPlainObj);
    return converted;
  }
}

function notPlainObj(block: {}): block is Node {
  return block && JSON.stringify(block) !== JSON.stringify({});
}

/**
 * Convert Markdown strings to JSON blocks that are compatable with Strapi's
 * Rich Text (Blocks) field.
 */
function convertToBlock(token: marked.Tokens.Generic, merge: {} = {}): {}[] {
  if (token.type === 'space') {
    return [{}];
  }

  if (token.type === 'heading') {
    return [
      {
        type: 'heading',
        level: token.depth,
        children: token.tokens?.flatMap(convertToBlock).filter(notPlainObj),
      },
    ];
  }

  if (token.type === 'paragraph') {
    const children = token.tokens?.flatMap(convertToBlock).filter(notPlainObj);
    return [
      {
        type: 'paragraph',
        children: children && children.length > 0 ? children : [{ type: 'text', text: '' }],
      },
    ];
  }

  if (token.type === 'strong') {
    return (token.tokens || [])
      .flatMap((t) => convertToBlock(t, { bold: true, ...merge }))
      .filter(notPlainObj);
  }

  if (token.type === 'em') {
    return (token.tokens || [])
      .flatMap((t) => convertToBlock(t, { italic: true, ...merge }))
      .filter(notPlainObj);
  }

  if (token.type === 'del') {
    return (token.tokens || [])
      .flatMap((t) => convertToBlock(t, { strikethrough: true, ...merge }))
      .filter(notPlainObj);
  }

  // there is no underline option here since markdown does not support underlines

  if (token.type === 'codespan') {
    return [{ type: 'text', code: true, text: token.text }];
  }

  if (token.type === 'text') {
    return [{ type: 'text', ...merge, text: token.text }];
  }

  if (token.type === 'link') {
    return [
      {
        type: 'link',
        url: token.href,
        children: (token.tokens || [])
          .flatMap(convertToBlock)
          .map((block) => ({ ...block, ...merge }))
          .filter(notPlainObj),
      },
    ];
  }

  // blockquotes can only have inline text :(
  // so we just remove blockquotes
  if (token.type === 'blockquote') {
    return (token.tokens || []).flatMap(convertToBlock).filter(notEmpty).filter(notPlainObj);
  }

  if (token.type === 'code') {
    return [{ type: 'code', children: [{ type: 'text', text: token.text }] }];
  }

  if (token.type === 'list' && token.ordered === true) {
    return [
      {
        type: 'list',
        format: 'ordered',
        children: token.items?.flatMap(convertToBlock).filter(notPlainObj),
      },
    ];
  }

  if (token.type === 'list' && token.ordered === false) {
    return [
      {
        type: 'list',
        format: 'unordered',
        children: token.items?.flatMap(convertToBlock).filter(notPlainObj),
      },
    ];
  }

  if (token.type === 'list_item') {
    return [
      {
        type: 'list-item',
        children: token.tokens
          // @ts-expect-error it exists
          ?.flatMap((token) => token.tokens?.flatMap(convertToBlock).filter(notPlainObj))
          .filter(notPlainObj),
      },
    ];
  }

  if (token.type === 'image') {
    // we should not have any photos in the data we are importing
    return [{}];
    return [
      {
        type: 'image',
        image: {
          ext: (token.href as string).split('.').slice(-1)[0],
          url: token.href,
          hash: '',
          mime: '',
          name: '',
          caption: token.title,
          alternativeText: token.text,
        },
      },
    ];
  }

  return [{}];
}

export const MarkdownToStrapi = new MarkDown();
