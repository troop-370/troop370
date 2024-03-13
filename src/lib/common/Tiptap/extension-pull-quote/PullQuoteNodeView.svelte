<script lang="ts">
  import type { NodeViewProps } from '@tiptap/core';
  import { NodeViewWrapper, editable } from 'svelte-tiptap';
  import WidgetWrapper from '../WidgetWrapper.svelte';

  export let editor: NodeViewProps['editor'];
  export let node: NodeViewProps['node'];
  export let getPos: NodeViewProps['getPos'];
  export let deleteNode: NodeViewProps['deleteNode'];

  function selectNodeTextEnd() {
    if (typeof getPos === 'function') {
      const resolvedPos = editor.state.doc.resolve(getPos() + 1);
      if (resolvedPos.nodeAfter) {
        editor.commands.setTextSelection(getPos() + 1 + resolvedPos.nodeAfter.nodeSize);
      }
    }
  }

  function handleKeyDown(evt: KeyboardEvent) {
    // delete the node if it is empty and the delete key is pressed
    if (evt.key === 'Delete' && node.textContent.length === 0) {
      evt.preventDefault();
      deleteNode();
    }
  }
</script>

<NodeViewWrapper>
  <WidgetWrapper position={node.attrs.position} on:click={selectNodeTextEnd} noBorder>
    <div class="pull-quote" on:keydown={handleKeyDown} contenteditable="false">
      <div use:editable class="editable" class:showPlaceholder={node.textContent.length === 0} />
    </div>
  </WidgetWrapper>
</NodeViewWrapper>

<style>
  .editable {
    display: block;
    font-size: 120%;
    font-weight: 400;
    text-align: center;
    outline: none !important;
  }

  .editable.showPlaceholder::before {
    content: 'Type a pull quote…';
    width: 100%;
    position: absolute;
    color: var(--theme-color-neutral-light-600);
    pointer-events: none;
    height: 0;
    transform: translateX(-50%);
  }

  .pull-quote {
    display: block;
    text-align: center;
    line-height: 1.3;
    padding: 20px 0;
    position: relative;
  }
  .pull-quote::before,
  .pull-quote::after {
    content: '';
    position: absolute;
    background-color: black;
    height: 2px;
    width: 50%;
    left: 25%;
  }
  .pull-quote::before {
    top: 0;
  }
  .pull-quote::after {
    bottom: 0;
  }
</style>
