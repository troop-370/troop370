import CharacterCount from '@tiptap/extension-character-count';
import Document from '@tiptap/extension-document';
import FontFamily from '@tiptap/extension-font-family';
import Link from '@tiptap/extension-link';
import Paragraph from '@tiptap/extension-paragraph';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import Text from '@tiptap/extension-text';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import { Slice } from 'prosemirror-model';
import { Plugin, PluginKey } from 'prosemirror-state';
import { ClassName } from './extension-class-name';
import { Comment } from './extension-comment';
import { FontSize } from './extension-font-size';
import { PhotoWidget } from './extension-photo';
import { PowerComment } from './extension-power-comment';
import { PullQuote } from './extension-pull-quote';
import { TrackChanges } from './extension-track-changes';
import { YoutubeWidget } from './extension-widget-youtube';

const ParagraphDocument = Document.extend({
  content: 'paragraph',
});

const Integer = Text.extend({
  addProseMirrorPlugins() {
    const schema = this.editor.schema;

    return [
      new Plugin({
        key: new PluginKey('eventHandler'),
        props: {
          handleTextInput(view, from, to, text) {
            // cancel input if it contains non-numeric character
            if (text.match(/[^0-9]/g)) return true;

            return false;
          },
          handlePaste(view, event, slice) {
            const json = slice.toJSON();
            const tr = view.state.tr;
            if (json?.content[0].content[0].text) {
              const text = json.content[0].content[0].text;

              // replace invalid characters and then insert the string
              json.content[0].content[0].text = text.replace(/[^0-9]/g, '');
              view.dispatch(tr.replaceSelection(Slice.fromJSON(schema, json)));
              return true;
            }

            return false;
          },
        },
      }),
    ];
  },
});

const Float = Text.extend({
  addProseMirrorPlugins() {
    const schema = this.editor.schema;

    return [
      new Plugin({
        key: new PluginKey('eventHandler'),
        props: {
          handleTextInput(view, from, to, text) {
            const hasDecimal = view.state.doc.textContent.includes('.');

            if (hasDecimal) {
              // cancel input if it contains non-numeric character
              if (text.match(/[^0-9]$/)) return true;
            } else {
              // cancel input if it contains non-numeric or non-decimal character
              if (text.match(/[^0-9,.]$/)) return true;
            }

            return false;
          },
          handlePaste(view, event, slice) {
            const json = slice.toJSON();
            const tr = view.state.tr;
            if (json?.content[0].content[0].text) {
              const text = json.content[0].content[0].text;

              // replace invalid characters and then insert the string
              const firstIndex = text.search(/\./) + 1;
              const stringFloat =
                text.substr(0, firstIndex) + text.slice(firstIndex).replace(/\./g, '');
              json.content[0].content[0].text = stringFloat;
              view.dispatch(tr.replaceSelection(Slice.fromJSON(schema, json)));
              return true;
            }

            return false;
          },
        },
      }),
    ];
  },
});

const editorExtensions = {
  tiptap: [
    StarterKit.configure({ history: false }),
    TrackChanges,
    Underline,
    TextStyle,
    FontFamily,
    FontSize,
    PowerComment,
    Comment,
    PullQuote,
    ClassName.configure({ types: ['heading', 'paragraph'] }),
    Link.extend({
      addAttributes() {
        return {
          href: {
            default: null,
          },
          target: {
            default: this.options.HTMLAttributes.target,
          },
          rel: {
            default: this.options.HTMLAttributes.rel,
          },
          class: {
            default: this.options.HTMLAttributes.class,
            // renderHTML: (attributes) => {
            //   let className = '';
            //   if (attributes.class) className += attributes.class;
            //   if (attributes.id) className += `~~file_${attributes.id}~~`;
            //   return { class: className };
            // },
          },
          file: {
            default: null,
            // parseHTML: (element) => {
            //   const className = element.getAttribute('class');
            //   const id = className?.match(/~~file_(\d+)~~/)?.[1];
            //   console.log(className, id);
            //   if (id) return { id };
            //   return null;
            // },
          },
        };
      },
    }).configure({
      HTMLAttributes: {
        target: '_self',
        rel: 'noopener noreferrer nofollow',
        onclick: 'return false;',
      },
      openOnClick: false,
      linkOnPaste: true,
    }),
    YoutubeWidget,
    PhotoWidget,
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    CharacterCount,
  ],
  text: [ParagraphDocument, Paragraph, Text],
  float: [ParagraphDocument, Paragraph, Float],
  integer: [ParagraphDocument, Paragraph, Integer],
};

export { editorExtensions };
