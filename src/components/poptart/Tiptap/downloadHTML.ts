import type { Editor } from '@tiptap/core';

function downloadHTML(editor: Editor, iframehtmlstring: string) {
  const html = editor.getHTML();
  const constructed = `<div>${iframehtmlstring}${html}</div>`;

  // create blob
  const blob = new Blob([constructed], { type: 'text/plain;charset=utf-8' });

  // download
  const url = window.URL || window.webkitURL;
  const link = url.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = 'document.html';
  a.href = link;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export { downloadHTML };
