<script lang="ts">
  import type { NodeViewProps } from '@tiptap/core';
  import { NodeViewContent, NodeViewWrapper } from 'svelte-tiptap';
  import WidgetWrapper from '../WidgetWrapper.svelte';

  export let node: NodeViewProps['node'];
</script>

<NodeViewWrapper>
  <WidgetWrapper position={node.attrs.position} noBorder>
    <div class="pull-quote">
      <div class="editable" class:showPlaceholder={node.textContent.length === 0}>
        <NodeViewContent contenteditable />
      </div>
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
