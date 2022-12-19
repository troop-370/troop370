import { marked, Renderer } from 'marked';
import { findLastIndex } from './findLastIndex';

type TOC = { title: string; level: 2 | 3 | 4 | 5 | 6 | 1; slug: string }[];
class MarkDown {
  #toc: TOC = [];

  rendererObject: {
    heading: NonNullable<marked.Renderer['heading']>;
    link: NonNullable<marked.Renderer['link']>;
    table: NonNullable<marked.Renderer['table']>;
  } = {
    heading: (text, level, raw, slugger) => {
      const [title, subtitle] = text.split('__splitSubtitle__');

      if (level === 1) {
        if (subtitle) {
          return `
          <h1>${title}</h1>
          <p>${subtitle}</p>
        `;
        }
        return `
        <h1>${title}</h1>
      `;
      }

      const slug = slugger.slug(text);

      this.#toc.push({ title, level, slug });

      return `
      <a href="#${slug}" style="color: inherit;"><h${level} id="${slug}">${title}</h${level}></a>
    `;
    },
    link: (href, title, text) => {
      let className = '';

      // forced-inverted outlined button (when on dark surface)
      if (text.indexOf('.iob') > 0 && text.indexOf('.iob') === text.length - 4) {
        text = text.replace('.iob', '');
        className = 'mdc-button-outlined--on-primary mdc-button mdc-button--outlined';
      }
      // outlined button
      else if (text.indexOf('.ob') > 0 && text.indexOf('.ob') === text.length - 3) {
        text = text.replace('.ob', '');
        className = 'mdc-button mdc-button--outlined';
      }
      // plain-text button
      else if (text.indexOf('.pb') > 0 && text.indexOf('.pb') === text.length - 3) {
        text = text.replace('.pb', '');
        className = 'mdc-button';
      }

      if (className.includes('mdc-button')) {
        return `
            <a href="${href}" class="${className}">
              <span class="mdc-button__ripple"></span>
              <span class="mdc-button__label">${text}</span>
            </a>
          `;
      }

      return `<a href="${href}">${text}</a>`;
    },
    table: (header, body) => {
      if (body) body = `<tbody>${body}</tbody>`;

      return (
        '<div class="table-wrapper">' +
        '<table>\n' +
        '<thead>\n' +
        header +
        '</thead>\n' +
        body +
        '</table>' +
        '</div>\n'
      );
    },
  };

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
    renderer.heading = this.rendererObject.heading;
    renderer.link = this.rendererObject.link;
    renderer.table = this.rendererObject.table;
    marked.use({
      renderer: renderer,
    });

    marked.use({
      extensions: [
        {
          name: 'hidden',
          level: 'block',
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          tokenizer: () => {},
          renderer: () => {
            return false;
          },
        },
        {
          name: 'h2DivWrap',
          level: 'block',
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          tokenizer() {},
          renderer(token) {
            const maybeH2 = token.tokens?.[0];
            if (isHeadingToken(maybeH2)) {
              const slugger = new marked.Slugger();
              const slug = 'section__' + slugger.slug(maybeH2.text);

              return `<div id="${slug}">${this.parser.parse(token.tokens || [])}\n</div>`;
            }

            return `<div>${this.parser.parse(token.tokens || [])}\n</div>`;
          },
        },
      ],
    });
  }

  parse(md: string, appendH1Md?: string) {
    this.configure();

    this.#toc = [];
    const tokens = this.parseTokens(md);

    // append tokens in from `appendHeadingMd` if there is an h1 heading
    const h1TokenIndex = tokens.findIndex((token) => isHeadingToken(token) && token.depth === 1);
    if (appendH1Md && h1TokenIndex !== -1) {
      const h1token = tokens[h1TokenIndex] as marked.Tokens.Heading;
      const inlineText = marked.parseInline(appendH1Md);

      const h1HasParagraph = !!h1token.tokens.find(
        (token) => token.type === 'text' && token.text === '__splitSubtitle__'
      );
      if (!h1HasParagraph) {
        h1token.tokens.push({
          type: 'text',
          raw: '__splitSubtitle__',
          text: '__splitSubtitle__',
        });
      }

      h1token.tokens.push({
        type: 'text',
        raw: appendH1Md,
        text: inlineText,
      });
    }

    return this.transform(tokens);
  }

  parseTokens(md: string): marked.Tokens.Generic[] {
    this.configure();
    const tokens = marked.lexer(md);

    // take the first paragraph after h1 and make it the subtitle
    const h1Index = tokens.findIndex((token) => isHeadingToken(token) && token.depth === 1);
    if (h1Index !== -1 && tokens.length > h1Index + 1) {
      const h1token = tokens[h1Index] as marked.Tokens.Heading;
      const nextToken = tokens[h1Index + 1];
      if (isParagraphToken(nextToken)) {
        h1token.tokens.push({ type: 'text', raw: '__splitSubtitle__', text: '__splitSubtitle__' });
        h1token.tokens.push(...nextToken.tokens);

        // @ts-expect-error: hidden will hide the token
        nextToken.type = 'hidden';
      }
    }

    // remove all but the first heading level 1
    const tokensFilteredHeadings = tokens.filter(
      (token, index) => !(isHeadingToken(token) && token.depth === 1 && index !== h1Index)
    );

    // group children of h2s
    const shouldSkipGrouping = tokensFilteredHeadings.some((token) => containsStyleTag(token.raw));
    const tokensGrouped: marked.Tokens.Generic[] = [];
    tokensFilteredHeadings.forEach((token) => {
      if (shouldSkipGrouping) {
        tokensGrouped.push(token);
        return;
      }

      const closestWrapIndex = findLastIndex(tokensGrouped, (token) => isH2DivWrap(token));
      const closestWrap = tokensGrouped[closestWrapIndex];

      // when we find a new heading token at level 2,
      // we create a new h2 group that will contain all
      // tokens found from this h2 (inclusive) until
      // the next h2 (exclusive)
      if (isHeadingToken(token) && token.depth === 2) {
        tokensGrouped.push({
          type: 'h2DivWrap',
          raw: token.raw,
          text: token.text,
          tokens: [token],
        });
        return;
      }

      // if there has not been an h2 group/wrapper
      // yet, we just push the token to the array
      if (!isH2DivWrap(closestWrap)) {
        tokensGrouped.push(token);
        return;
      }

      // add tokens to the h2 group/wrapper, ensuring
      // to also include their raw content and text
      // in the h2 group/wrapper token
      closestWrap.raw += token.raw;
      //@ts-expect-error text might not exist, which is why we fall back to raw
      closestWrap.text += token.text || token.raw.trim();
      closestWrap.tokens.push(token);
    });

    return tokensGrouped;
  }

  transform(tokens: marked.Tokens.Generic[]): [string | null, string, TOC] {
    this.configure();

    const parsedContent = marked.parser(
      tokens.filter((token) => !(isHeadingToken(token) && token.depth === 1)) as marked.Token[]
    );

    const headingToken = tokens.find((token) => isHeadingToken(token) && token.depth === 1);
    if (headingToken) {
      const parsedHeading = marked.parser([headingToken as marked.Token]);
      return [parsedHeading, parsedContent, this.#toc];
    }

    return [null, parsedContent, this.#toc];
  }
}

export const Markdown = new MarkDown();

function isParagraphToken(toCheck?: marked.Tokens.Generic): toCheck is marked.Tokens.Paragraph {
  return toCheck?.type === 'paragraph';
}

function isHeadingToken(toCheck?: marked.Tokens.Generic): toCheck is marked.Tokens.Heading {
  return toCheck?.type === 'heading';
}

interface h2DivWrapToken extends marked.Tokens.Generic {
  type: 'h2DivWrap';
  raw: string;
  text: string;
  tokens: marked.Token[];
}

function isH2DivWrap(toCheck?: marked.Tokens.Generic): toCheck is h2DivWrapToken {
  return toCheck?.type === 'h2DivWrap';
}

function containsHTML(toCheck?: string): boolean {
  return !!toCheck?.match(/<\/?[a-z][\s\S]*>/);
}

function containsStyleTag(toCheck?: string): boolean {
  return !!(
    toCheck &&
    containsHTML(toCheck) &&
    toCheck.includes('<style') &&
    toCheck.includes('</style>')
  );
}
