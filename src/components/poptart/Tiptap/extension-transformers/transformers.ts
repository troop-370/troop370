import { debounce } from '$utils';
import { Editor, Extension } from '@tiptap/core';
import type { tiptapOptions } from '../tiptapOptions';

interface TransformersOptions {}

interface TransformersStorage {
  fieldOptions?: tiptapOptions;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    transformers: {
      setFieldOptions: (fieldOptions: TransformersStorage['fieldOptions']) => ReturnType;
      /**
       * Removes all font family marks from the document.
       */
      removeFontFamilyMarks: (allowedFontFamilies?: string[]) => ReturnType;
      /**
       * Removes all font size marks from the document.
       */
      removeFontSizeMarks: (allowedFontSizes?: string[]) => ReturnType;
      unsetAllBold: () => ReturnType;
      unsetAllItalic: () => ReturnType;
      unsetAllUnderline: () => ReturnType;
      unsetAllStrike: () => ReturnType;
      unsetAllCode: () => ReturnType;
      unsetAllLinks: () => ReturnType;
      removeAllOrderedLists: () => ReturnType;
      removeAllBulletLists: () => ReturnType;
      removeAllHorizontalRules: () => ReturnType;
      removeAllPhotoWidgets: () => ReturnType;
      removeAllYouTubeWidgets: () => ReturnType;
      removeAllPullQuotes: () => ReturnType;
      deleteAllTables: () => ReturnType;
    };
  }
}

function transform(editor: Editor, fieldOptions?: tiptapOptions) {
  editor.commands.removeFontFamilyMarks(fieldOptions?.features?.fontFamilies?.map((ff) => ff.name));

  editor.commands.removeFontSizeMarks(fieldOptions?.features?.fontSizes);

  if (!fieldOptions?.features.bold) {
    editor.commands.unsetAllBold();
  }

  if (!fieldOptions?.features.italic) {
    editor.commands.unsetAllItalic();
  }

  if (!fieldOptions?.features.underline) {
    editor.commands.unsetAllUnderline();
  }

  if (!fieldOptions?.features.strike) {
    editor.commands.unsetAllStrike();
  }

  if (!fieldOptions?.features.code) {
    editor.commands.unsetAllCode();
  }

  if (!fieldOptions?.features.link) {
    editor.commands.unsetAllLinks();
  }

  if (!fieldOptions?.features.orderedList) {
    editor.commands.removeAllOrderedLists();
  }

  if (!fieldOptions?.features.bulletList) {
    editor.commands.removeAllBulletLists();
  }

  if (!fieldOptions?.features.horizontalRule) {
    editor.commands.removeAllHorizontalRules();
  }

  if (!fieldOptions?.features.widgets?.photoWidget) {
    editor.commands.removeAllPhotoWidgets();
  }

  if (!fieldOptions?.features.widgets?.youtube) {
    editor.commands.removeAllYouTubeWidgets();
  }

  if (!fieldOptions?.features.pullQuote) {
    editor.commands.removeAllPullQuotes();
  }

  if (!fieldOptions?.features.table) {
    editor.commands.deleteAllTables();
  }
}
const debouncedTransform = debounce(transform, 300);

const Transformers = Extension.create<TransformersOptions, TransformersStorage>({
  name: 'transformers',

  addStorage() {
    return {
      fieldOptions: undefined,
    };
  },

  onCreate() {
    this.editor.on('update', () => {
      debouncedTransform(this.editor, this.storage.fieldOptions);
    });
    this.editor.on('paste', () => {
      setTimeout(() => {
        transform(this.editor, this.storage.fieldOptions);
      });
    });
  },

  addCommands() {
    return {
      setFieldOptions: (fieldOptions) => () => {
        this.storage.fieldOptions = fieldOptions;
        return true;
      },
      removeFontFamilyMarks:
        (allowedFontFamilies = []) =>
        ({ commands, state }) => {
          return commands.command(({ tr, dispatch, commands }) => {
            if (dispatch) {
              const initialSelection = tr.selection;

              // search for text nodes with font family marks
              // and remove the marks if the font family is not allowed
              state.doc.descendants((node, pos) => {
                if (node.isText && node.marks.length > 0) {
                  node.marks.forEach((mark) => {
                    if (mark.type.name === 'textStyle' && mark.attrs.fontFamily) {
                      const familyIsAllowed = allowedFontFamilies.includes(mark.attrs.fontFamily);
                      if (familyIsAllowed) return;

                      const from = tr.mapping.map(pos);
                      const to = tr.mapping.map(pos + node.nodeSize);

                      commands.setTextSelection({ from, to });
                      commands.unsetFontFamily();
                    }
                  });
                }
              });

              // restore the selection
              const from = tr.mapping.map(initialSelection.from);
              const to = tr.mapping.map(initialSelection.to);
              commands.setTextSelection({ from, to });

              // apply the transaction to the editor state
              tr.setMeta('addToHistory', false); // prevent this transaction from being added to the undo stack
              dispatch(tr);
            }
            return true;
          });
        },
      removeFontSizeMarks:
        (allowedFontSizes = []) =>
        ({ commands, state }) => {
          return commands.command(({ tr, dispatch, commands }) => {
            if (dispatch) {
              const initialSelection = tr.selection;

              // search for text nodes with font size marks
              // and remove the marks if the font size is not allowed
              state.doc.descendants((node, pos) => {
                if (node.isText && node.marks.length > 0) {
                  node.marks.forEach((mark) => {
                    if (mark.type.name === 'textStyle' && mark.attrs.fontSize) {
                      const sizeIsAllowed = allowedFontSizes.includes(mark.attrs.fontSize);
                      if (sizeIsAllowed) return;

                      const from = tr.mapping.map(pos);
                      const to = tr.mapping.map(pos + node.nodeSize);

                      commands.setTextSelection({ from, to });
                      commands.unsetFontSize();
                    }
                  });
                }
              });

              // restore the selection
              const from = tr.mapping.map(initialSelection.from);
              const to = tr.mapping.map(initialSelection.to);
              commands.setTextSelection({ from, to });

              // apply the transaction to the editor state
              tr.setMeta('addToHistory', false); // prevent this transaction from being added to the undo stack
              dispatch(tr);
            }
            return true;
          });
        },
      unsetAllBold:
        () =>
        ({ tr, dispatch, chain }) => {
          if (!dispatch) return true;
          const initialSelection = tr.selection;
          return chain()
            .selectAll()
            .unsetBold()
            .setTextSelection(initialSelection)
            .setMeta('addToHistory', false)
            .run();
        },
      unsetAllItalic:
        () =>
        ({ tr, dispatch, chain }) => {
          if (!dispatch) return true;
          const initialSelection = tr.selection;
          return chain()
            .selectAll()
            .unsetItalic()
            .setTextSelection(initialSelection)
            .setMeta('addToHistory', false)
            .run();
        },
      unsetAllUnderline:
        () =>
        ({ tr, dispatch, chain }) => {
          if (!dispatch) return true;
          const initialSelection = tr.selection;
          return chain()
            .selectAll()
            .unsetUnderline()
            .setTextSelection(initialSelection)
            .setMeta('addToHistory', false)
            .run();
        },
      unsetAllStrike:
        () =>
        ({ tr, dispatch, chain }) => {
          if (!dispatch) return true;
          const initialSelection = tr.selection;
          return chain()
            .selectAll()
            .unsetStrike()
            .setTextSelection(initialSelection)
            .setMeta('addToHistory', false)
            .run();
        },
      unsetAllCode:
        () =>
        ({ tr, dispatch, chain }) => {
          if (!dispatch) return true;
          const initialSelection = tr.selection;
          return chain()
            .selectAll()
            .unsetCode()
            .setTextSelection(initialSelection)
            .setMeta('addToHistory', false)
            .run();
        },
      unsetAllLinks:
        () =>
        ({ tr, dispatch, chain }) => {
          if (!dispatch) return true;
          const initialSelection = tr.selection;
          return chain()
            .selectAll()
            .unsetLink()
            .setTextSelection(initialSelection)
            .setMeta('addToHistory', false)
            .run();
        },
      removeAllOrderedLists:
        () =>
        ({ tr, state, dispatch, commands }) => {
          if (dispatch) {
            const initialSelection = tr.selection;

            // search for ordered list nodes
            // and remove them
            state.doc.descendants((node, pos) => {
              if (node.type.name === 'orderedList') {
                const from = tr.mapping.map(pos);
                const to = tr.mapping.map(pos + node.nodeSize);

                commands.setTextSelection({ from, to });
                commands.clearNodes();
              }
            });

            // restore the selection
            const from = tr.mapping.map(initialSelection.from);
            const to = tr.mapping.map(initialSelection.to);
            commands.setTextSelection({ from, to });

            // apply the transaction to the editor state
            tr.setMeta('addToHistory', false); // prevent this transaction from being added to the undo stack
            dispatch(tr);
          }
          return true;
        },
      removeAllBulletLists:
        () =>
        ({ tr, state, dispatch, commands }) => {
          if (dispatch) {
            const initialSelection = tr.selection;

            // search for bullet list nodes
            // and remove them
            state.doc.descendants((node, pos) => {
              if (node.type.name === 'bulletList') {
                const from = tr.mapping.map(pos);
                const to = tr.mapping.map(pos + node.nodeSize);

                commands.setTextSelection({ from, to });
                commands.clearNodes();
              }
            });

            // restore the selection
            const from = tr.mapping.map(initialSelection.from);
            const to = tr.mapping.map(initialSelection.to);
            commands.setTextSelection({ from, to });

            // apply the transaction to the editor state
            tr.setMeta('addToHistory', false); // prevent this transaction from being added to the undo stack
            dispatch(tr);
          }
          return true;
        },
      removeAllHorizontalRules:
        () =>
        ({ tr, state, dispatch, commands }) => {
          if (dispatch) {
            state.doc.descendants((node, pos) => {
              if (node.type.name === 'horizontalRule') {
                const from = tr.mapping.map(pos);
                const to = tr.mapping.map(pos + node.nodeSize);

                commands.deleteRange({ from, to });
              }
            });

            // apply the transaction to the editor state
            tr.setMeta('addToHistory', false); // prevent this transaction from being added to the undo stack
            dispatch(tr);
          }
          return true;
        },
      removeAllPhotoWidgets:
        () =>
        ({ tr, state, dispatch, commands }) => {
          if (dispatch) {
            state.doc.descendants((node, pos) => {
              if (node.type.name === 'photoWidget') {
                const from = tr.mapping.map(pos);
                const to = tr.mapping.map(pos + node.nodeSize);

                commands.deleteRange({ from, to });
              }
            });

            // apply the transaction to the editor state
            tr.setMeta('addToHistory', false); // prevent this transaction from being added to the undo stack
            dispatch(tr);
          }
          return true;
        },
      removeAllYouTubeWidgets:
        () =>
        ({ tr, state, dispatch, commands }) => {
          if (dispatch) {
            state.doc.descendants((node, pos) => {
              if (node.type.name === 'youtubeWidget') {
                const from = tr.mapping.map(pos);
                const to = tr.mapping.map(pos + node.nodeSize);

                commands.deleteRange({ from, to });
              }
            });

            // apply the transaction to the editor state
            tr.setMeta('addToHistory', false); // prevent this transaction from being added to the undo stack
            dispatch(tr);
          }
          return true;
        },
      removeAllPullQuotes:
        () =>
        ({ tr, state, dispatch, commands }) => {
          if (dispatch) {
            state.doc.descendants((node, pos) => {
              if (node.type.name === 'pullQuote') {
                const from = tr.mapping.map(pos);
                const to = tr.mapping.map(pos + node.nodeSize);

                commands.deleteRange({ from, to });
              }
            });

            // apply the transaction to the editor state
            tr.setMeta('addToHistory', false); // prevent this transaction from being added to the undo stack
            dispatch(tr);
          }
          return true;
        },
      deleteAllTables:
        () =>
        ({ tr, state, dispatch, commands }) => {
          if (dispatch) {
            state.doc.descendants((node, pos) => {
              if (node.type.name === 'table') {
                const from = tr.mapping.map(pos);
                const to = tr.mapping.map(pos + node.nodeSize);

                // delete the table and then inset the text content as a replacement
                commands.deleteRange({ from, to });
                commands.insertContent(node.textContent);
              }
            });

            // apply the transaction to the editor state
            tr.setMeta('addToHistory', false); // prevent this transaction from being added to the undo stack
            dispatch(tr);
          }
          return true;
        },
    };
  },
});

export { Transformers };
export type { TransformersOptions };
