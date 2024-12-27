<script lang="ts">
  import { SetDocAttrStep } from '$utils/SetDocAttrStep';
  import { Editor, type AnyExtension } from '@tiptap/core';
  import BubbleMenu from '@tiptap/extension-bubble-menu';
  import Collaboration from '@tiptap/extension-collaboration';
  import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
  import { onDestroy, onMount } from 'svelte';
  import type { Readable } from 'svelte/store';
  import { WebrtcProvider } from 'y-webrtc';
  import * as Y from 'yjs';
  import { richTextParams } from './richTextParams';
  import type { tiptapOptions } from './tiptapOptions';
  import type { AwarenessUser } from './types';

  /**
   * A yjs document that should be updated with the values of this field.
   */
  export let ydoc: Readable<Y.Doc>;
  /**
   * The key/field in the ydoc shared types that will be used for this field.
   */
  export let ydocKey: string = 'default';
  export let disabled = false;
  export let user: AwarenessUser;
  export const options: tiptapOptions | undefined = undefined;
  export let extensions: AnyExtension[];
  export let noTextFormatting = false;

  export let style = '';

  let element: HTMLDivElement;
  export let editor: Editor | null = null;
  export let bubbleMenuParagraph: HTMLElement | undefined = undefined;

  onMount(() => {
    const provider = new WebrtcProvider('cristata-' + Math.random() + Date.now(), $ydoc, {
      password: 'cristata-' + Math.random() + Date.now(),
      maxConns: 0,
    });

    editor = new Editor({
      element: element,
      editable: !disabled,
      extensions: [
        ...extensions,
        // support collaboration
        Collaboration.configure({
          document: $ydoc,
          field: ydocKey,
        }),
        // show cursor locations when collaborating
        CollaborationCursor.configure({ provider }),
        BubbleMenu.configure({
          pluginKey: 'bubbleMenuParagraph',
          element: bubbleMenuParagraph,
          shouldShow: ({ editor }) => {
            return (
              (editor.isActive('paragraph') ||
                editor.isActive('youtubeWidget', { showCaption: true })) &&
              editor.state.selection.from !== editor.state.selection.to
            );
          },
          tippyOptions: {
            placement: 'top-start',
          },
        }),
      ],
      onTransaction: (props) => {
        // force re-render so `editor.isActive` works as expected
        editor = props.editor;
      },
      onSelectionUpdate: ({ editor }) => {
        // if comments panel is not open, open it when anchor is placed in the comment
        if ($richTextParams.obj.comments !== 1) {
          const anchorIsInComment = editor.state.selection.$anchor
            .marks()
            .some((mark) => mark.type.name === 'powerComment');
          if (anchorIsInComment) {
            $richTextParams.set('comments', 1);
          }
        }
      },
    });

    // initialize the trackChanges attr
    editor.state.tr.step(new SetDocAttrStep('trackChanges', false));
  });

  // keep disabled stated in sync
  $: editor?.setOptions({ editable: !disabled });

  // update user details in the collaboration extension
  $: editor?.commands.updateUser(user);

  // make user name and color available to tiptap extensions via document attributes
  $: editor?.state.tr.step(new SetDocAttrStep('user', user));

  onDestroy(() => {
    if (editor) {
      editor.destroy();
    }
  });
</script>

<div class="text-box-container" class:disabled {style}>
  <div style="width: 100%;" bind:this={element} class:textFormatting={!noTextFormatting} />
  <div class="text-box-underline" />
</div>

<style>
  div :global(p) {
    margin: 0;
  }
  div :global(.ProseMirror) {
    background-color: transparent;
    border: none;
    border-radius: var(--fds-control-corner-radius);
    box-sizing: border-box;
    cursor: unset;
    flex: 1 1 auto;
    inline-size: 100%;
    margin: 0;
    min-block-size: 30px;
    outline: none;
    padding-inline: 10px;
    padding-block: 5px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  div.textFormatting :global(.ProseMirror) {
    color: var(--fds-text-primary);
    font-family: var(--fds-font-family-text);
    font-size: var(--fds-body-font-size);
    font-weight: 400;
    line-height: 20px;
  }
  div :global(.ProseMirror)::-moz-placeholder {
    -moz-user-select: none;
    user-select: none;
  }
  div.textFormatting :global(.ProseMirror)::-moz-placeholder {
    color: var(--fds-text-secondary);
  }
  div :global(.ProseMirror):-ms-input-placeholder {
    -ms-user-select: none;
    user-select: none;
  }
  div.textFormatting :global(.ProseMirror):-ms-input-placeholder {
    color: var(--fds-text-secondary);
  }
  div :global(.ProseMirror)::placeholder {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  div.textFormatting :global(.ProseMirror)::placeholder {
    color: var(--fds-text-secondary);
  }
  div :global(.ProseMirror)::-webkit-search-cancel-button,
  div :global(.ProseMirror)::-webkit-search-decoration,
  div :global(.ProseMirror)::-webkit-search-results-button,
  div :global(.ProseMirror)::-webkit-search-results-decoration {
    -webkit-appearance: none;
  }
  div :global(.ProseMirror)::-ms-reveal {
    display: none;
  }
  div :global(.ProseMirror):disabled {
    color: var(--fds-text-disabled);
  }
  div :global(.ProseMirror):disabled::-moz-placeholder {
    color: var(--fds-text-disabled);
  }
  div :global(.ProseMirror):disabled:-ms-input-placeholder {
    color: var(--fds-text-disabled);
  }
  div :global(.ProseMirror):disabled::placeholder {
    color: var(--fds-text-disabled);
  }
  .text-box-container {
    align-items: center;
    background-clip: padding-box;
    background-color: var(--fds-control-fill-default);
    border: 1px solid var(--fds-control-stroke-default);
    border-radius: var(--fds-control-corner-radius);
    cursor: text;
    display: flex;
    inline-size: 100%;
    position: relative;
  }
  .text-box-container:hover {
    background-color: var(--fds-control-fill-secondary);
  }
  .text-box-container.disabled {
    background-color: var(--fds-control-fill-disabled);
    cursor: default;
  }
  .text-box-container.disabled .text-box-underline {
    display: none;
  }
  .text-box-container:focus-within {
    background-color: var(--fds-control-fill-input-active);
  }
  .text-box-container:focus-within div :global(.ProseMirror)::-moz-placeholder {
    color: var(--fds-text-tertiary);
  }
  .text-box-container:focus-within div :global(.ProseMirror):-ms-input-placeholder {
    color: var(--fds-text-tertiary);
  }
  .text-box-container:focus-within div :global(.ProseMirror)::placeholder {
    color: var(--fds-text-tertiary);
  }
  .text-box-container:focus-within .text-box-underline:after {
    border-bottom: 2px solid var(--fds-accent-default);
  }
  .text-box-container:focus-within :global(.text-box-clear-button) {
    display: flex;
  }
  .text-box-underline {
    block-size: calc(100% + 2px);
    border-radius: var(--fds-control-corner-radius);
    inline-size: calc(100% + 2px);
    inset-block-start: -1px;
    inset-inline-start: -1px;
    overflow: hidden;
    pointer-events: none;
    position: absolute;
  }
  .text-box-underline:after {
    block-size: 100%;
    border-bottom: 1px solid var(--fds-control-strong-stroke-default);
    box-sizing: border-box;
    content: '';
    inline-size: 100%;
    inset-block-end: 0;
    inset-inline-start: 0;
    position: absolute;
  }
</style>
