import { Extension, getMarkType } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Deletion } from './';
import { setDeletionFunction } from './deletion';

const DeletionEventHandler = Extension.create({
  name: 'deletionEventHandler',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('deletionEventHandler'),
        props: {
          handleTextInput({ state, dispatch }, from, to, text) {
            if (!state.doc.attrs?.trackChanges) {
              // typing inside a node with the deletion mark should insert text in a node without the deletion mark
              if (state.doc.rangeHasMark(from - 1, to, getMarkType(Deletion.name, state.schema))) {
                dispatch(
                  state.tr
                    .insertText(text, from, to)
                    .removeMark(from, from + 1, getMarkType(Deletion.name, state.schema))
                );
                return true;
              }
            }

            return false;
          },
          handleDOMEvents: {
            paste: ({ state, dispatch }, event) => {
              const tr = state.tr;

              const range = {
                from: state.selection.from,
                to: state.selection.to,
              };

              // add deletion mark to range and move caret to end of range
              if (state.doc.attrs?.trackChanges) {
                setDeletionFunction(range, getMarkType(Deletion.name, state.schema), tr, state, dispatch, 1);
              }

              return false;
            },
            keydown: ({ state, dispatch }, event) => {
              const tr = state.tr;
              const doc = state.doc;

              const range = {
                from: state.selection.from,
                to: state.selection.to,
              };

              const isRangeMultipleCharacters = range.from !== range.to;

              // replace the backspace event when track changes is turned on
              // and instead add a deletion mark to the node(s) in the range
              if (state.doc.attrs?.trackChanges && event.key === 'Backspace') {
                event.preventDefault();
                if (!isRangeMultipleCharacters) {
                  if (state.selection.from !== 1 && state.selection.$from.nodeBefore === null) {
                    // When attempting the backspace after the end of a block node, we need to also select the
                    // end of the block nodSe (block nodes always end with a empty range of 1).
                    // Selecting the end will result in a pilcrow being inserted with a strikethrough.
                    setDeletionFunction(
                      { from: range.from - 2, to: range.from },
                      getMarkType(Deletion.name, state.schema),
                      tr,
                      state,
                      dispatch
                    );
                  } else {
                    setDeletionFunction(
                      { from: range.from - 1, to: range.from },
                      getMarkType(Deletion.name, state.schema),
                      tr,
                      state,
                      dispatch
                    );
                  }
                } else {
                  setDeletionFunction(range, getMarkType(Deletion.name, state.schema), tr, state, dispatch);
                }
                return true;
              }

              // replace the delete event when track changes is turned on
              // and instead add a deletion mark to the node(s) in the range
              if (state.doc.attrs?.trackChanges && event.key === 'Delete') {
                event.preventDefault();
                if (!isRangeMultipleCharacters) {
                  setDeletionFunction(
                    { from: range.to, to: range.to + 1 },
                    getMarkType(Deletion.name, state.schema),
                    tr,
                    state,
                    dispatch,
                    1
                  );
                } else {
                  setDeletionFunction(range, getMarkType(Deletion.name, state.schema), tr, state, dispatch, 1);
                }
                return true;
              }

              // when track changes is turned on, add a deletion mark to the node(s) in the range
              // when the Enter key is pressed
              if (state.doc.attrs?.trackChanges && event.key === 'Enter' && isRangeMultipleCharacters) {
                setDeletionFunction(range, getMarkType(Deletion.name, state.schema), tr, state, dispatch, 1);
              }

              if (
                state.doc.attrs?.trackChanges &&
                (event.ctrlKey || event.metaKey) &&
                event.keyCode === 'X'.charCodeAt(0)
              ) {
                const cut = async () => {
                  event.preventDefault();

                  // write the slection text to the clipboard
                  const text = doc.textBetween(range.from, range.to);
                  // TODO: handle the case when a user has denied permission to the clipboard
                  await navigator.clipboard.writeText(text);

                  // add deletion mark to range and move caret to right of range
                  setDeletionFunction(range, getMarkType(Deletion.name, state.schema), tr, state, dispatch, 1);
                };
                cut();
              }

              return false;
            },
          },
        },
      }),
    ];
  },
});

export { DeletionEventHandler };
