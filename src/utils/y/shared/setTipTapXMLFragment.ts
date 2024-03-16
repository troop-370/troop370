import { getSchema, type Extensions } from '@tiptap/core';
import Collaboration from '@tiptap/extension-collaboration';
import { prosemirrorJSONToYXmlFragment } from 'y-prosemirror';
import type * as Y from 'yjs';

function setTipTapXMLFragment(
  field: string,
  content: string | undefined | null,
  document: Y.Doc,
  extensions: Extensions
): string {
  // delete current value
  const current = document.getXmlFragment(field);
  current.delete(0, current.length);

  const schema = getSchema([
    ...extensions,
    // set the sharsed type value at the provided key
    Collaboration.configure({ document, field }),
  ]);

  // set the shared type based on this value
  if (content) {
    // if content is stringified json object, parse it before inserting it
    if (isJsonContentArrayString(content)) {
      prosemirrorJSONToYXmlFragment(schema, { type: 'doc', content: JSON.parse(content) }, current);
    } else {
      prosemirrorJSONToYXmlFragment(
        schema,
        {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: content }] }],
        },
        current
      );
    }
  }

  // return the DOM version of the content
  return current.toJSON();
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
