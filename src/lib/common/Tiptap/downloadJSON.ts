import type { Editor } from '@tiptap/core';

function downloadJSON(editor: Editor) {
  const json = editor.getJSON();

  // create blob
  const blobJson = [JSON.stringify(json)];
  const blob = new Blob(blobJson, { type: 'application/json;charset=utf-8' });

  // download
  const url = window.URL || window.webkitURL;
  const link = url.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = `document.json`;
  a.href = link;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export { downloadJSON };
