import { Node } from '@tiptap/core';
import { SvelteNodeViewRenderer } from 'svelte-tiptap';
import PullQuoteNodeView from './PullQuoteNodeView.svelte';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pullQuote: {
      insertPullQuote: () => ReturnType;
    };
  }
}

interface PullQuoteOptions {}

const PullQuote = Node.create<PullQuoteOptions>({
  name: 'pullQuote',

  // only allow zero or more inline nodes
  content: 'text*',

  group: 'block',

  draggable: true,

  allowGapCursor: false,

  /**
   *
   */
  addAttributes() {
    return {
      position: {
        default: 'right',
        renderHTML: (attributes) => ({
          'data-wrap-position': attributes.position,
        }),
        parseHTML: (element) => element.getAttribute('data-wrap-position') || 'right',
      },
    };
  },

  /**
   *
   */
  renderHTML({ HTMLAttributes }) {
    return ['pullquote', HTMLAttributes, 0];
  },

  /**
   *
   */
  parseHTML() {
    return [{ tag: 'pullquote' }];
  },

  /**
   *
   */
  addCommands() {
    return {
      insertPullQuote:
        () =>
        ({ state, dispatch, chain }) => {
          if (dispatch) {
            // remove anything within the selection
            state.tr.deleteRange(state.selection.from, state.selection.to);

            // split the node twice where the caret is located
            // (this creates an empty node between two nodes with content)
            state.tr.split(state.selection.from);
            state.tr.split(state.selection.from);

            // set the type of the empty node to the pull quote type
            state.tr.setBlockType(state.selection.from - 2, state.selection.to - 2, this.type);

            // insert placeholder text
            // chain()
            //   .focus()
            //   .setTextSelection(state.selection.from - 2)
            //   .insertContent('pull quote')
            //   .setTextSelection({ from: state.selection.from - 2, to: state.selection.from + 8 })
            //   .setBold()
            //   .run();

            return dispatch(state.tr);
          }

          return true;
        },
    };
  },

  addNodeView() {
    return SvelteNodeViewRenderer(PullQuoteNodeView);
  },
});

export { PullQuote };
export type { PullQuoteOptions };
