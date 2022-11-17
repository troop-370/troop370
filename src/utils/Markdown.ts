import { marked } from 'marked';

class MarkDown {
  #renderer: marked.RendererObject = {
    heading(text, level) {
      const [title, subtitle] = text.split('__splitSubtitle__');

      if (level === 1) {
        if (subtitle) {
          return `
            <div class="banner">
              <h1>${title}</h1>
              <p>${subtitle}</p>
            </div>
          `;
        }
        return `
          <div class="banner">
            <h1>${title}</h1>
          </div>
        `;
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

  parse(md: string) {
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

    // parse and return
    const parsed = marked.parser(tokens);
    return parsed;
  }
}

export const Markdown = new MarkDown();

function isParagraphToken(toCheck: marked.Token): toCheck is marked.Tokens.Paragraph {
  return toCheck.type === 'paragraph';
}

function isHeadingToken(toCheck: marked.Token): toCheck is marked.Tokens.Heading {
  return toCheck.type === 'heading';
}
