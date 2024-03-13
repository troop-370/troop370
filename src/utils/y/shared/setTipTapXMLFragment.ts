import type { Extensions } from '@tiptap/core';
import { Editor } from '@tiptap/core';
import Collaboration from '@tiptap/extension-collaboration';
import type * as Y from 'yjs';

function setTipTapXMLFragment(
  field: string,
  content: string | undefined | null,
  document: Y.Doc,
  extensions: Extensions
): Node {
  // delete current value
  const current = document.getXmlFragment(field);
  current.delete(0, current.length);

  // set value in tiptap
  const tiptap = new Editor({
    extensions: [
      ...extensions,
      // set the sharsed type value at the provided key
      Collaboration.configure({ document, field }),
    ],
  });

  // set the shared type based on this value
  if (content) {
    // if content is stringified json object, parse it before inserting it
    if (isJsonContentArrayString(content)) {
      tiptap.commands.setContent(JSON.parse(content));
    } else {
      tiptap.commands.setContent(content);
    }
  }

  // destroy tiptap editor
  tiptap.destroy();

  // return the DOM version of the content
  return current.toDOM();
}

/**
 * Returns whether an input string is a
 * stringified JSON content array.
 */
function isJsonContentArrayString(str: string) {
  try {
    const parsed = JSON.parse(str);
    return typeof parsed === 'object' && Array.isArray(parsed);
  } catch {
    return false;
  }
}

export { setTipTapXMLFragment };
