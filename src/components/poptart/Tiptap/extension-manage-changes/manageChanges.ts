import type { Range } from '@tiptap/core';
import { Extension } from '@tiptap/core';
import type { Node as ProsemirrorNode } from 'prosemirror-model';
import type { Transaction } from 'prosemirror-state';
import { TextSelection } from 'prosemirror-state';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    manageChanges: {
      /**
       * Approve the changes in the selection.
       *
       * _This command will ONLY look at the first node in the selection._
       *
       */
      approveChange: (range?: Range) => ReturnType;
      /**
       * Reject the changes in the selection.
       */
      rejectChange: (range?: Range) => ReturnType;
      /**
       * Find the next change in the document
       */
      nextChange: (range?: Range) => ReturnType;
      /**
       * Find the previous change in the document
       */
      previousChange: (range?: Range) => ReturnType;
    };
  }
}

const ManageChanges = Extension.create({
  name: 'manageChanges',

  addCommands() {
    return {
      approveChange:
        (range?: Range) =>
        ({ tr, state, dispatch }) => {
          if (!range) {
            range = { from: state.selection.from, to: state.selection.to };
          }

          // get the nodes inside the range, and store needed info inside the nodes array
          let evaluatedPosition = range.from;
          let nodes = [];
          while (evaluatedPosition < range.to) {
            const node = tr.doc.resolve(evaluatedPosition).nodeAfter; // resolve the position and store `nodeAfter`
            const nodeSize = node?.nodeSize || 2; // go to the next node that is a child of the block node
            nodes.push({
              from: evaluatedPosition,
              to: evaluatedPosition + nodeSize > range.to ? range.to : evaluatedPosition + nodeSize, // prevent `to` from being larger than `range.to`
              pilcrowPosition: node?.text?.indexOf('¶'),
              marks: node?.marks || [],
            });
            evaluatedPosition += nodeSize;
          }

          // return whether change can be accepted (dispatch is undefined when using `editor.can()`)
          const rangeContainsChange = nodes.some((node) =>
            node.marks.some((mark) => mark.type.name === 'addition' || mark.type.name === 'deletion')
          );
          if (!dispatch) return rangeContainsChange;

          // convert pilcrows
          let rangeDisplacement = 0; // keep track of the displacement of nodes after deleting nodes
          nodes.forEach((node) => {
            for (let i = 0; i < node.marks.length; i++) {
              if (node.marks[i].type.name === 'addition' && node.pilcrowPosition !== (-1 || undefined)) {
                tr.delete(
                  node.from + (node.pilcrowPosition || 0) + rangeDisplacement,
                  node.from + (node.pilcrowPosition || 0) + 1 + rangeDisplacement
                ); // delete pilcrow
                rangeDisplacement--;
              }
              if (node.marks[i].type.name === 'deletion' && node.pilcrowPosition !== (-1 || undefined)) {
                tr.join(node.from + (node.pilcrowPosition || 0) + 2 + rangeDisplacement); // join the two paragraphs
                rangeDisplacement -= 2;
                tr.delete(
                  node.from + (node.pilcrowPosition || 0) + rangeDisplacement + 2,
                  node.from + (node.pilcrowPosition || 0) + 1 + rangeDisplacement + 2
                ); // delete pilcrow
                rangeDisplacement--;
              }
            }
          });

          // remove marks
          nodes.forEach((node) => {
            for (let i = 0; i < node.marks.length; i++) {
              if (node.marks[i].type.name === 'addition') {
                tr.removeMark(node.from + rangeDisplacement, node.to + rangeDisplacement, node.marks[i].type);
              } else if (node.marks[i].type.name === 'deletion') {
                tr.deleteRange(node.from + rangeDisplacement, node.to + rangeDisplacement);
                rangeDisplacement -= node.to - node.from;
              }
            }
          });

          dispatch(tr);
          return false;
        },
      rejectChange:
        (range?: Range) =>
        ({ tr, state, dispatch }) => {
          if (!range) {
            range = { from: state.selection.from, to: state.selection.to };
          }

          // remove plain additions and deletions (excludes additions and deletions with pilcrows)
          const textNodes = getTextNodes(range, tr).reverse(); // start at end of selection so that ranges for each node remain correct
          textNodes.forEach((node) => {
            for (let i = 0; i < node.node.marks.length; i++) {
              if (node.node.marks[i].type.name === 'deletion' && node.node.text?.indexOf('¶') === -1) {
                tr.removeMark(node.from, node.to, node.node.marks[i]); // remove the deletion mark from the node
              }
              if (node.node.marks[i].type.name === 'addition' && node.node.text?.indexOf('¶') === -1) {
                tr.delete(node.from, node.to);
                // @ts-expect-error (ts thinks range could be undefined)
                range.to -= node.to - node.from;
                break;
              }
            }
          });

          // return whether change can be accepted (dispatch is undefined when using `editor.can()`)
          const rangeContainsChange = textNodes.some(({ node }) =>
            node.marks.some((mark) => mark.type.name === 'addition' || mark.type.name === 'deletion')
          );
          if (!dispatch) return rangeContainsChange;

          // convert pilcrows
          const textNodesPilcrows = getTextNodes(range, tr).reverse();
          textNodesPilcrows.forEach((node) => {
            for (let i = 0; i < node.node.marks.length; i++) {
              if (node.node.marks[i].type.name === 'deletion' && node.node.text?.indexOf('¶') !== -1) {
                tr.delete(node.to - 1, node.to); // delete the last character, which will always be a pilcrow
                tr.removeMark(node.from, node.to - 1, node.node.marks[i]); // remove the deletion mark from the rest of the node
                break;
              }
              if (node.node.marks[i].type.name === 'addition' && node.node.text?.indexOf('¶') !== -1) {
                tr.join(node.to + 1); // join the two paragraph nodes
                tr.delete(node.from, node.to);
                break;
              }
            }
          });

          dispatch?.(tr);
          return false;
        },
      nextChange:
        (range?: Range) =>
        ({ tr, state, dispatch }) => {
          if (!range) {
            range = { from: state.selection.from, to: state.selection.to };
          }

          // search for the next node with a change by increments of 50 range
          let nextChangeNode = undefined;
          const docSize = tr.doc.nodeSize - 2; // do not include the edges of the doc node
          while (nextChangeNode === undefined) {
            if (range.to + 10 >= docSize) {
              nextChangeNode = null;
              return false;
            }

            const closeTextNodes = getTextNodes(
              { from: range.to, to: range.to + 10 > docSize ? docSize : range.to + 10 },
              tr
            );
            // identify the nearest text node that contains a change
            nextChangeNode = closeTextNodes.filter(({ node }) => {
              // true if the text node contains an addition or deletion mark
              return !!node.marks.find(({ type }) => type.name === 'addition' || type.name === 'deletion');
            })[0];
            range.to += 10;
          }

          if (!dispatch) return !!nextChangeNode;

          // select the node with the additon or deletion mark
          if (nextChangeNode) {
            tr.setSelection(
              new TextSelection(tr.doc.resolve(nextChangeNode.from), tr.doc.resolve(nextChangeNode.to))
            );
          }

          dispatch(tr);

          return false;
        },
      previousChange:
        (range?: Range) =>
        ({ tr, state, dispatch }) => {
          if (!range) {
            range = { from: state.selection.from, to: state.selection.to };
          }

          // search for the next node with a change by increments of 50 range
          let previousChangeNode = undefined;
          while (previousChangeNode === undefined) {
            if (range.from - 10 < 1) {
              previousChangeNode = null;
            }
            const closeTextNodes = getTextNodes(
              { from: range.from - 10 < 1 ? 1 : range.from - 10, to: range.from },
              tr
            );
            for (let i = 0; i < closeTextNodes.length; i++) {
              for (let j = 0; j < closeTextNodes[i].node.marks.length; j++) {
                if (
                  closeTextNodes[i].node.marks[j].type.name === 'addition' ||
                  closeTextNodes[i].node.marks[j].type.name === 'deletion'
                ) {
                  previousChangeNode = closeTextNodes[i];
                }
              }
            }
            range.from -= 10;
          }

          if (!dispatch) return !!previousChangeNode;

          // select the node with the additon or deletion mark
          if (previousChangeNode) {
            tr.setSelection(
              new TextSelection(tr.doc.resolve(previousChangeNode.from), tr.doc.resolve(previousChangeNode.to))
            );
          }

          dispatch(tr);

          return false;
        },
    };
  },
});

function getTextNodes(range: Range, tr: Transaction) {
  let textNodes: Array<{ from: number; to: number; node: ProsemirrorNode }> = [];
  tr.doc.nodesBetween(range.from, range.to, (node, index) => {
    if (node?.type.name === 'text') {
      textNodes.push({
        node: node,
        from: index,
        to: index + node?.nodeSize,
      });
    }
  });
  return textNodes;
}

export { ManageChanges };
