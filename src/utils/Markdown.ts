import { marked } from 'marked';

const h2DivWrapExtension: marked.TokenizerExtension & marked.RendererExtension = {
  name: 'h2DivWrap',
  level: 'block',
  start(src) {
    return src.match(/:[^:\n]/)?.index; // Hint to Marked.js to stop and check for a match
  },
  tokenizer(src) {
    const rule = /(?:^|\n)##\s[^\n]*\n(.*?)(?=\n##?\s|$)/gs;
    const match = rule.exec(src);

    if (match && !containsHTML(src)) {
      const entireMatch = match[0];
      const sectionContent = match[1];
      const headingContent = entireMatch.replace(match[1], '');
      const headingText = headingContent.replace('## ', '').replace('##', '').trim();

      const headingToken: marked.Tokens.Heading = {
        type: 'heading',
        depth: 2,
        raw: headingContent,
        text: headingText,
        tokens: this.lexer.inlineTokens(headingText),
      };

      const sectionTokens = this.lexer.blockTokens(sectionContent.trim(), []);

      const token = {
        type: 'h2DivWrap',
        // We add the heading content to the entire match so that the length of raw
        // matches the length of the generated text.
        // Otherwise, the parser will assume that there is leftover text,
        // which would result in a some text from the end of the provided
        // markdown string being appended to the end of the generated HTML string
        raw: headingContent + entireMatch,
        text: entireMatch.trim(),
        tokens: [headingToken, ...sectionTokens],
      };

      return token;
    }
  },
  renderer(token) {
    const maybeH2 = token.tokens?.[0];
    if (isHeadingToken(maybeH2)) {
      const slugger = new marked.Slugger();
      const slug = 'section__' + slugger.slug(maybeH2.text);

      return `<div id="${slug}">${this.parser.parse(token.tokens || [])}\n</div>`;
    }

    return `<div>${this.parser.parse(token.tokens || [])}\n</div>`;
  },
};
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
        h2DivWrapExtension,
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

function isParagraphToken(toCheck?: marked.Token): toCheck is marked.Tokens.Paragraph {
  return toCheck?.type === 'paragraph';
}

function isHeadingToken(toCheck?: marked.Token): toCheck is marked.Tokens.Heading {
  return toCheck?.type === 'heading';
}

function containsHTML(toCheck?: string): boolean {
  return !!toCheck?.match(/<\/?[a-z][\s\S]*>/);
}
