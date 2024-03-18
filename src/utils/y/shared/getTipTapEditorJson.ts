import { yXmlFragmentToProsemirrorJSON } from 'y-prosemirror';
import type * as Y from 'yjs';

function getTipTapEditorJson(field: string, document: Y.Doc): string {
  // get current value
  const current = document.getXmlFragment(field);

  // convert the fragment to json
  const json = yXmlFragmentToProsemirrorJSON(current);

  // return the content in the document
  return JSON.stringify(json.content);
}

export { getTipTapEditorJson };
