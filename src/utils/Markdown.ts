import { marked } from 'marked';

class MarkDown {
  #renderer: marked.RendererObject = {
    heading(text, level) {
      const [title, subtitle] = text.split('__splitSubtitle__');

      if (level === 1) {
        if (subtitle) {
          return `
              <h1>${title}</h1>
              <p>${subtitle}</p>
          `;
        }
      }

      return false;
    },
  };

  constructor() {
    marked.setOptions({
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
    });

    marked.use({
      renderer: this.#renderer,
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
      ],
    });
  }

  parse(md: string, appendH1Md?: string) {
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

  parseTokens(md: string) {
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

    return tokensFilteredHeadings;
  }

  transform(tokens: marked.Token[]): [string | null, string] {
    const parsedContent = marked.parser(
      tokens.filter((token) => !(isHeadingToken(token) && token.depth === 1))
    );

    const headingToken = tokens.find((token) => isHeadingToken(token) && token.depth === 1);
    if (headingToken) {
      const parsedHeading = marked.parser([headingToken]);
      return [parsedHeading, parsedContent];
    }

    return [null, parsedContent];
  }
}

export const Markdown = new MarkDown();

function isParagraphToken(toCheck: marked.Token): toCheck is marked.Tokens.Paragraph {
  return toCheck.type === 'paragraph';
}

function isHeadingToken(toCheck: marked.Token): toCheck is marked.Tokens.Heading {
  return toCheck.type === 'heading';
}
