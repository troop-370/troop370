import type { Range } from '@tiptap/core';
import { Mark, markInputRule, markPasteRule } from '@tiptap/core';
import { DateTime } from 'luxon';
import type { MarkType } from 'prosemirror-model';
import type { EditorState, Transaction } from 'prosemirror-state';
import { TextSelection } from 'prosemirror-state';
import { v4 as uuidv4 } from 'uuid';

type DispatchFunction = ((args?: any) => any) | undefined;

/**
 * Explanation from `@atlaskit`
 * ProseMirror uses the Unicode Character 'OBJECT REPLACEMENT CHARACTER' (U+FFFC) as text representation for
 * leaf nodes, i.e. nodes that don't have any content or text property (e.g. hardBreak, emoji, mention, rule)
 * It was introduced because of https://github.com/ProseMirror/prosemirror/issues/262
 * This can be used in an input rule regex to be able to include or exclude such nodes.
 */
const LEAF_NODE_REPLACING_CHARACTER = '\uFFFC';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    deletion: {
      /**
       * Toggle the deletion mark for the selected range.
       *
       * _Any node with an addition mark inside the range will be deleted._
       *
       * _This toggle impliments a custom version of `toggleMark()` so that
       * nodes with addition marks can be deleted instead of converted into
       * deletion marks._
       */
      toggleDeletion: (color: string, user: string) => ReturnType;
      /**
       * Add the deletion mark to the provided range.
       *
       * _Any node with an addition mark inside the range will be deleted._
       */
      setDeletion: (color: string, user: string) => ReturnType;
      /**
       * Remove the deletion mark from the provided range.
       *
       * _Any node with an addition mark inside the range will be deleted._
       */
      unsetDeletion: () => ReturnType;
    };
  }
}

interface DeletionOptions {}

const Deletion = Mark.create<DeletionOptions>({
  name: 'deletion',

  // the cursor at the edges of the mark should not be considered within the mark
  inclusive: false,

  excludes: 'addition deletion strike',

  group: 'inline markSupportsExit',

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
            style: `color: ${attributes.color}; text-decoration: line-through; text-decoration-style: double;`,
          };
        },
        parseHTML: (element) => element.style.color || '#d0021b',
      },
      user: {
        default: 'Unknown User',
        renderHTML: (attributes) => ({
          'data-user': attributes.user,
          title: `Deletion by ${attributes.user} on ${DateTime.fromISO(attributes.timestamp).toFormat(
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
    return ['deletion', HTMLAttributes, 0];
  },

  /**
   *
   */
  parseHTML() {
    return [{ tag: 'deletion' }];
  },

  addPasteRules() {
    return [markPasteRule({ find: /`([^`]+)`/g, type: this.type })];
  },

  addInputRule() {
    return [
      markInputRule({
        find: new RegExp(`(?:\`)([^\`${LEAF_NODE_REPLACING_CHARACTER}]+)(?:\`)$`),
        type: this.type,
      }),
    ];
  },

  /**
   *
   */
  addCommands() {
    return {
      toggleDeletion:
        (color: string, user: string) =>
        ({ tr, state, dispatch }) => {
          const range = { from: state.selection.from, to: state.selection.to };

          if (state.doc.rangeHasMark(range.from, range.to, this.type)) {
            removeDeletionFunction(range, this.type, tr, state, dispatch);
          } else {
            setDeletionFunction(range, this.type, tr, state, dispatch);
          }

          return true;
        },
      setDeletion:
        (color: string, user: string) =>
        ({ tr, state, dispatch }) => {
          const range = { from: state.selection.from, to: state.selection.to };

          setDeletionFunction(range, this.type, tr, state, dispatch);

          return true;
        },
      unsetDeletion:
        () =>
        ({ tr, state, dispatch }) => {
          const range = { from: state.selection.from, to: state.selection.to };

          removeDeletionFunction(range, this.type, tr, state, dispatch);

          return true;
        },
    };
  },
});

/**
 * Add the deletion mark to the selected or provided range.
 *
 * _Any node with an addition mark inside the range will be deleted._
 *
 * TODO add check to see that provided range is valid.
 */
function setDeletionFunction(
  range: Range,
  type: MarkType,
  tr: Transaction,
  state: EditorState,
  dispatch?: DispatchFunction,
  caret = 0,
  callback?: (tr: Transaction) => void
) {
  if (!range) {
    range = { from: state.selection.from, to: state.selection.to };
  }

  // get the nodes inside the range, and store them inside the nodes array
  let evaluatedPosition = range.from;
  let nodes = [];
  while (evaluatedPosition < range.to) {
    const node = tr.doc.resolve(evaluatedPosition).nodeAfter; // resolve the position and store `nodeAfter`
    const nodeSize = node?.nodeSize || 1; // all nodes have a minimum size of 1
    nodes.push({
      from: evaluatedPosition,
      to: evaluatedPosition + nodeSize > range.to ? range.to : evaluatedPosition + nodeSize, // prevent `to` from being larger than `range.to`
      marks: node?.marks || [],
      isBlockNodeEnd: node === null,
    });
    evaluatedPosition += nodeSize;
  }

  // delete any node with the addition mark and reduce the size of the range
  let newRangeTo = range.to;
  nodes.forEach((node) => {
    for (let i = 0; i < node.marks.length; i++) {
      if (node.marks[i].type.name === 'addition') {
        tr.delete(node.from, node.to);
        newRangeTo -= node.to - node.from;
      }
    }
  });

  // at end of block nodes, insert a pilcrow to represent joined paragraphs
  nodes.forEach((node) => {
    if (node.isBlockNodeEnd) {
      tr.insertText('¶', node.from, node.from);
      newRangeTo++;
    }
  });

  // add the deletion mark to the remaining nodes in the reduced range
  tr.addMark(
    range.from,
    newRangeTo,
    type.create({ user: state.doc.attrs?.user?.name, color: state.doc.attrs?.user?.color })
  );

  // set the caret position (1: move to right; 0: move to left)
  const resolvedCaretPosition = caret === 1 ? tr.doc.resolve(newRangeTo) : tr.doc.resolve(range.from);
  tr.setSelection(new TextSelection(resolvedCaretPosition, resolvedCaretPosition));

  if (callback) {
    callback(tr);
  }

  dispatch?.(tr);
}

/**
 * Remove the deletion mark from the selected or provided range.
 *
 * TODO add check that the provided range is valid.
 */
function removeDeletionFunction(
  range: Range,
  type: MarkType,
  tr: Transaction,
  state: EditorState,
  dispatch?: DispatchFunction
) {
  if (!range) {
    range = { from: state.selection.from, to: state.selection.to };
  }

  dispatch?.(tr.removeMark(range?.from, range?.to, type));

  return true;
}

export { Deletion, removeDeletionFunction, setDeletionFunction };
export type { DeletionOptions };
