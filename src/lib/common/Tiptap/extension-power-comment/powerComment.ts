import type { Editor } from '@tiptap/core';
import { Mark } from '@tiptap/core';
import Color from 'color';
import type { MarkType, Mark as ProseMirrorMark, ResolvedPos, Slice } from 'prosemirror-model';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import { TextSelection } from 'prosemirror-state';
import { v4 as uuidv4 } from 'uuid';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    powerComment: {
      /**
       * Wrap text nodes in a comment node.
       */
      setComment: (
        attrs: Partial<CommentAttrs> &
          Pick<CommentAttrs, 'color'> &
          Pick<CommentAttrs, 'commenter'> &
          Pick<CommentAttrs, 'sessionId'>
      ) => ReturnType;
      /**
       * Remove the comment node included in the selection.
       *
       * Any child text nodes will be reinserted.
       *
       * This command will expand the selection to include the entiere comment node.
       */
      unsetComment: (position?: number, overrideRange?: { from: number; to: number }) => ReturnType;
    };
  }
}

interface CommentStorage {
  /**
   * Get the comments in the current document.
   */
  comments: Array<{ nodes: ProseMirrorNodeWithComment[]; attrs: CommentAttrs; type: MarkType }>;
}

interface CommentAttrs {
  color: string;
  alpha: number;
  message: string;
  timestamp: string;
  commenter: {
    name: string;
    photo: string;
  };
  uuid: string;
  // the sessionId of the person who created this comment (not synced or saved)
  sessionId?: string;
  replies: Array<{
    message: string;
    timestamp: string;
    commenter: {
      name: string;
      photo: string;
    };
    uuid: string;
  }>;
}

interface CommentOptions {}

const PowerComment = Mark.create<CommentOptions, CommentStorage>({
  name: 'powerComment',

  // add to 'inline' group
  group: 'inline',

  // renders comments in line with the text
  inline: true,

  // the cursor at the edges of the mark should be considered within the mark
  inclusive: true,

  // only allow zero or more inline nodes
  content: 'text*',

  priority: 10000, // default: 1000

  // allow this mark to span multiple nodes
  spanning: true,

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
          try {
            return {
              style: `background-color: ${Color(attributes.color || '#faf0a2')
                .alpha(attributes.alpha8 || 0.15)
                .string()}`,
            };
          } catch (error) {
            console.error(error, 'color: ' + attributes.color, 'alpha: ' + attributes.alpha);
            return {
              style: `background-color: ${Color('#faf0a2').alpha(0.15).string()}`,
            };
          }
        },
        parseHTML: (element) => {
          return element.style.backgroundColor || '#faf0a2';
        },
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
        renderHTML: (attributes) => ({
          'data-uuid': attributes.uuid,
        }),
        parseHTML: (element) => element.getAttribute('data-uuid') || uuidv4(),
      },
      replies: {
        default: [],
        renderHTML: (attributes) => ({
          'data-replies': JSON.stringify(attributes.replies),
        }),
        parseHTML: (element) => {
          const attr = element.getAttribute('data-replies');
          const replies = JSON.parse(attr || '[]').filter(
            (reply: CommentAttrs['replies'][0]) =>
              !!reply.commenter && !reply.message && !!reply.timestamp && !!reply.uuid
          );
          return replies;
        },
      },
      sessionId: { default: undefined },
    };
  },

  /**
   *
   */
  renderHTML({ HTMLAttributes }) {
    return ['power-comment', { 'data-tip': 'Maximize the editor to view this comment', ...HTMLAttributes }, 0];
  },

  /**
   *
   */
  parseHTML() {
    return [{ tag: 'powerComment' }];
  },

  /**
   *
   */
  addCommands() {
    return {
      setComment:
        (attrs: Partial<CommentAttrs> & Pick<CommentAttrs, 'color'> & Pick<CommentAttrs, 'commenter'>) =>
        ({ state, dispatch, chain }) => {
          try {
            if (state.selection.empty) return false;

            // a slice containing the selected nodes
            const selectionSlice: Slice = state.selection.content();

            // keep track of whether the selection includes the comment so that we do not insert
            // overlapping comments
            let selectionIncludesComment = false;
            selectionSlice.content.descendants((node) => {
              if (node.marks.some((mark) => mark.type === this.type)) selectionIncludesComment = true;
            });

            // dispatch is undefined when testing whether the command is possible with `can()`
            if (dispatch) {
              // only insert the comment when the selection does not already include a comment
              if (selectionSlice && !selectionIncludesComment) {
                return chain()
                  .setMark(this.type, { uuid: uuidv4(), timestamp: new Date().toISOString(), ...attrs })
                  .run();
              }
            }

            // when the selection slice does not include another comment,
            // tell tiptap that this command is possible
            return !selectionIncludesComment;
          } catch (error) {
            console.error(error);
            return false;
          }
        },
      unsetComment:
        (position, overrideRange) =>
        ({ chain, state }) => {
          const originalPosition = { from: state.selection.from, to: state.selection.to };
          return chain()
            .command(({ tr }) => {
              try {
                // if position is defined, change the the positon (move the cursor)
                if (position) {
                  tr.setSelection(TextSelection.create(tr.doc, position));
                }
                return true;
              } catch (error) {
                console.error(error);
                return false;
              }
            })
            .command(({ tr, dispatch }) => {
              try {
                if (overrideRange) {
                  if (dispatch) {
                    tr.setSelection(TextSelection.create(tr.doc, overrideRange.from, overrideRange.to));
                  }

                  return true;
                }

                const $anchor = tr.selection.$anchor;

                // determine if the selection is contained to a single comment
                const anchorMarks = $anchor.marks().map((mark) => mark.type);
                if (anchorMarks.includes(this.type)) {
                  // ensure the selection only contains the comment
                  const commentRange = markExtend(
                    $anchor,
                    $anchor.marks().find((mark) => mark.type === this.type)!
                  );
                  if (commentRange.from <= tr.selection.from && commentRange.to >= tr.selection.to) {
                    // expand the selection to entire comment
                    if (dispatch) {
                      tr.setSelection(TextSelection.create(tr.doc, commentRange.from, commentRange.to));
                    }

                    return true;
                  }
                }
                return false;
              } catch (error) {
                console.error(error);
                return false;
              }
            })
            .command(({ chain, dispatch }) => {
              try {
                if (dispatch) {
                  chain().unsetMark(this.type).setTextSelection(originalPosition).run();
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

  addStorage() {
    return {
      comments: [],
    };
  },

  onUpdate() {
    this.storage.comments = getAllComments(this.editor as Editor, this.type);
  },
});

/**
 * Get all comments.
 */
function getAllComments(editor: Editor, type: MarkType) {
  const commentMarks: Array<{ nodes: ProseMirrorNodeWithComment[]; attrs: CommentAttrs; type: MarkType }> = [];
  editor.state.doc.content.descendants((node: ProseMirrorNode, pos: number) => {
    const containsComment = node.marks.some((mark) => mark.type.name === 'powerComment');
    if (containsComment) {
      const commentAttrs = node.marks.find((mark) => mark.type.name === 'powerComment')!.attrs;

      const linkedCommentIndex = commentMarks.findIndex(({ attrs }) => attrs.uuid === commentAttrs.uuid); // they share same uuid
      if (linkedCommentIndex !== -1) {
        commentMarks[linkedCommentIndex] = {
          attrs: commentAttrs as CommentAttrs,
          nodes: [...commentMarks[linkedCommentIndex].nodes, Object.assign(node, { pos })],
          type,
        };
      } else {
        commentMarks.push({ attrs: commentAttrs as CommentAttrs, nodes: [Object.assign(node, { pos })], type });
      }
    }
  });
  return commentMarks;
}

/**
 * Extend the range to include the entire mark.
 *
 * _Adapted from https://discuss.prosemirror.net/t/find-extents-of-a-mark-given-a-selection/344/7_
 */
function markExtend($start: ResolvedPos, mark: ProseMirrorMark) {
  let startIndex = $start.index();
  let endIndex = $start.indexAfter();
  while (
    startIndex > 0 &&
    // must be the same mark type
    mark.type.isInSet($start.parent.child(startIndex - 1).marks) &&
    // must have the same attributes
    $start.parent.child(startIndex - 1).marks.every((m) => m.eq(mark))
  )
    startIndex--;
  while (
    endIndex < $start.parent.childCount &&
    // must be the same mark type
    mark.type.isInSet($start.parent.child(endIndex).marks) &&
    // must have the same attributes
    $start.parent.child(endIndex).marks.every((m) => m.eq(mark))
  )
    endIndex++;
  let startPos = $start.start(),
    endPos = startPos;
  for (let i = 0; i < endIndex; i++) {
    let size = $start.parent.child(i).nodeSize;
    if (i < startIndex) startPos += size;
    endPos += size;
  }
  return { from: startPos, to: endPos };
}

class ProseMirrorNodeWithComment extends ProseMirrorNode {
  pos!: number;
}

export { PowerComment };
export type { CommentOptions, CommentStorage };
