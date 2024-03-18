import { Mark } from '@tiptap/core';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    addition: {
      /**
       * Toggle the addition mark for the selected range
       */
      toggleAddition: (color: string, user: string) => ReturnType;
      /**
       * Add the addition mark to the provided range.
       */
      setAddition: (color: string, user: string) => ReturnType;
      /**
       * Remove the addition mark from the provided range.
       */
      unsetAddition: () => ReturnType;
    };
  }
}

interface AdditionOptions {}

const Addition = Mark.create<AdditionOptions>({
  name: 'addition',

  // the cursor at the edges of the mark should not be considered within the mark
  inclusive: false,

  excludes: 'deletion addition',

  group: 'inline markSupportsExits',

  /**
   *
   */
  addAttributes() {
    return {
      // use a color attrubute to define the color of text
      color: {
        // use this color by default
        default: '#d0021b',
        // apply these attributes to the rendered element in the editor
        renderHTML: (attributes) => {
          return {
            style: `color: ${attributes.color}; border-bottom: 4px double ${attributes.color};`,
          };
        },
        parseHTML: (element) => element.style.color || '#d0021b',
      },
      user: {
        default: 'Unknown User',
        renderHTML: (attributes) => ({
          'data-user': attributes.user,
          title: `Addition by ${attributes.user} on ${DateTime.fromISO(attributes.timestamp).toFormat(
            `LLL. dd, yyyy 'at' t`
          )}`,
        }),
        parseHTML: (element) => element.getAttribute('data-user'),
      },
      timestamp: {
        default: new Date().toISOString(),
        renderHTML: (attributes) => ({
          'data-timestamp': attributes.timestamp,
        }),
        parseHTML: (element) => element.getAttribute('data-timestamp') || new Date(0).toISOString(),
      },
      uuid: {
        default: uuidv4(),
        renderHTML: (attributes) => ({
          'data-uuid': attributes.uuid,
        }),
        parseHTML: (element) => element.getAttribute('data-uuid') || uuidv4(),
      },
    };
  },

  /**
   *
   */
  renderHTML({ HTMLAttributes }) {
    return ['addition', HTMLAttributes, 0];
  },

  /**
   *
   */
  parseHTML() {
    return [{ tag: 'addition' }];
  },

  /**
   *
   */
  addCommands() {
    return {
      toggleAddition:
        (color: string, user: string) =>
        ({ commands }) => {
          return commands.toggleMark(this.type, { color, user, timestamp: new Date().toISOString() });
        },
      setAddition:
        (color: string, user: string) =>
        ({ commands }) => {
          return commands.setMark(this.type, { color, user, timestamp: new Date().toISOString() });
        },
      unsetAddition:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.type);
        },
    };
  },
});

export { Addition };
export type { AdditionOptions };
