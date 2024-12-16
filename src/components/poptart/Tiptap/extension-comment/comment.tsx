import type { JSONContent } from '@tiptap/core';
import { Node } from '@tiptap/core';
import Color from 'color';
import type { Node as ProsemirrorNode } from 'prosemirror-model';
import { Slice } from 'prosemirror-model';
import { TextSelection } from 'prosemirror-state';
import { v4 as uuidv4 } from 'uuid';
// import { CommentContainer } from './CommentContainer';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      /**
       * Wrap text nodes in a comment node.
       */
      setLegacyComment: (color: string, commenter: { name: string; photo: string }) => ReturnType;
      /**
       * Remove the comment node included in the selection.
       *
       * Any child text nodes will be reinserted.
       *
       * This command will expand the selection to include the entiere comment node.
       */
      unsetLegacyComment: (position?: number) => ReturnType;
    };
  }
}

interface CommentOptions {}

const Comment = Node.create<CommentOptions>({
  name: 'comment',

  // add to 'inline' group
  group: 'inline',

  // renders comment nodes in line with the text
  inline: true,

  // only allow zero or more inline nodes
  content: 'text*',

  /**
   *
   */
  addAttributes() {
    return {
      // use a color attrubute to define the background color of text highlighted with a comment
      color: {
        // use this color by default
        default: '#faf0a2',
        // apply these attributes to the rendered element in the editor
        renderHTML: (attributes) => {
          return {
            style: `background-color: ${Color(attributes.color).alpha(attributes.alpha).string()}`,
          };
        },
        parseHTML: (element) => element.style.backgroundColor || '#faf0a2',
      },
      alpha: {
        default: 0.15,
      },
      message: {
        default: '',
        renderHTML: (attributes) => ({
          'data-message': attributes.message,
        }),
        parseHTML: (element) => element.getAttribute('data-message') || '',
      },
      timestamp: {
        default: new Date().toISOString(),
        renderHTML: (attributes) => ({
          'data-timestamp': attributes.timestamp,
        }),
        parseHTML: (element) => element.getAttribute('data-timestamp') || new Date(0).toISOString(),
      },
      commenter: {
        default: {
          name: 'Unknown Commenter',
          photo: 'https://avatars.githubusercontent.com/u/69555023',
        },
        renderHTML: (attributes) => ({
          'data-commenter': JSON.stringify(attributes.commenter),
        }),
        parseHTML: (element) => {
          const attr = element.getAttribute('data-commenter');
          const commenter = JSON.parse(
            attr ||
              '{ "name": "Unknown Commenter", "photo": "https://avatars.githubusercontent.com/u/69555023" }'
          );
          return commenter;
        },
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
    return ['commment', HTMLAttributes, 0];
  },

  /**
   *
   */
  parseHTML() {
    return [{ tag: 'comment' }];
  },

  /**
   *
   */
  addCommands() {
    return {
      setLegacyComment:
        (color: string, commenter: { name: string; photo: string }) =>
        ({ state, dispatch, chain }) => {
          try {
            // a slice containing the selected nodes
            const selectionSlice = state.selection.content();

            // keep track of whether the selection includes the comment so that we do no insert
            // overlapping comments
            let selectionIncludesComment = false;
            selectionSlice.content.descendants((node) => {
              if (node.type === this.type) selectionIncludesComment = true;
            });

            if (dispatch) {
              // dispatch is undefined when testing whether the command is possible with `can()`

              if (selectionSlice && selectionSlice.content.childCount === 1 && !selectionIncludesComment) {
                // obtain all text nodes located in the first child node of the slice
                // NOTES:
                // - only look in the first child node since comments cannot span
                //   more than one block node)
                // - only nodes that are children to the first child node will be
                //   text nodes)
                // - continuing when the slice contains more than one node would
                //   cause two block nodes to collapse into one since the
                //   `replaceSelectionWith` will remove and ends and starts to
                //   block nodes
                // - continuing when the slice contains an existing comment would
                //   result in overlapping comments
                const selectionTextNodes = textNodesFromSliceFirstChild(selectionSlice);
                if (selectionTextNodes) {
                  // convert text nodes to JSON so they can be inserted into the editor
                  const textNodeJSON = selectionTextNodes.map((node) =>
                    node.toJSON()
                  ) as unknown as JSONContent[];
                  // delete the current selection and then insert the text nodes
                  return chain()
                    .deleteSelection()
                    .insertContent([{ content: textNodeJSON, type: 'comment', attrs: { color, commenter } }])
                    .run();
                }
              }
            }

            // when the selection slice only contains one child,
            // tell tiptap that this command is possible
            return selectionSlice.content.childCount === 1 && !selectionIncludesComment;
          } catch (error) {
            console.error(error);
            return false;
          }
        },
      unsetLegacyComment:
        (position) =>
        ({ chain, commands, state, tr, dispatch }) => {
          return chain()
            .command(({ tr }) => {
              try {
                // if position is defined, change the the positon (move the cursor)
                if (position) {
                  tr.setSelection(TextSelection.create(state.doc, position));
                }
                return true;
              } catch (error) {
                console.error(error);
                return false;
              }
            })
            .command(({ tr }) => {
              try {
                // get the parent node, which is the entire comment node if the anchor is inside the comment
                const parent = tr.selection.$anchor;
                // check whether the node is a comment node
                const isComment = parent.node().type.name === this.type.name;
                return isComment;
              } catch (error) {
                console.error(error);
                return false;
              }
            })
            .command(({ tr, chain }) => {
              try {
                if (dispatch) {
                  // dispatch is undefined when testing whether the command is possible with `can()`
                  // get the entire comment node
                  const comment = tr.selection.$anchor.parent;

                  // also store the start position of the comment
                  const start = tr.selection.$anchor.start();

                  // get the text nodes in the comment node
                  const textNodes: ProsemirrorNode[] = [];
                  comment.content.descendants((textNode) => {
                    textNodes.push(textNode);
                  });

                  // get the type of the node that is the parent of the comment node
                  // (usually a paragraph)
                  const parentNodeType = tr.doc.resolve(start).parent.type;

                  // create a new node that matches the new parent type
                  const newNode = parentNodeType.createAndFill({}, textNodes);

                  // select the entire comment node and delete it
                  tr.setSelection(TextSelection.near(tr.selection.$anchor));
                  chain().selectParentNode().deleteSelection().run();

                  if (newNode) {
                    // replace the empty space left after removing the comment and
                    // replace it with the slice, which has the text nodes inside
                    // of the comment node
                    const slice = new Slice(newNode.content, 0, 0);
                    tr.replace(start - 1, start - 1, slice);
                  }
                }
                return true;
              } catch (error) {
                console.error(error);
                return false;
              }
            })
            .run();
        },
    };
  },

  // addNodeView() {
  //   return ReactNodeViewRenderer(CommentContainer);
  // },
});

/**
 * Get text nodes (recursively) from a slice.
 * @returns array of TextNodes; null if no nodes in slice
 */
function textNodesFromSliceFirstChild(slice: Slice) {
  /**
   * Find the text nodes in a slice.
   */
  const findTextNodes = (node: ProsemirrorNode) => {
    const descendants: ProsemirrorNode[] = [];
    node.descendants((childNode) => {
      descendants.push(childNode);
    });

    // store any text noted that have been found
    const TextNodes = descendants.map((childNode) => {
      // if it is a text node, return it to the TextNodes constant
      if (childNode.isText) return childNode;

      // if the child is not text and it has children, find the children's text nodes
      if (childNode.childCount !== 0) {
        const childDescendants: ProsemirrorNode[] = [];
        childNode.descendants((childNodeChildren) => {
          descendants.push(childNodeChildren);
        });
        childDescendants.map((child) => findTextNodes(child));
      }

      // otherwise return undefined
      return undefined;
    });

    return TextNodes.filter((x) => {
      // filter out undefined values
      return x !== undefined;
    }) as unknown as ProsemirrorNode[];
  };

  // start the function that recursively looks for text nodes
  if (slice.content.firstChild) {
    return findTextNodes(slice.content.firstChild);
  }
  return null;
}

export { Comment };
export type { CommentOptions };
