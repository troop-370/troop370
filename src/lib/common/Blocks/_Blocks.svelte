<script lang="ts">
  import { createEditor } from 'slate';
  import { Editable, Slate, withSvelte } from 'svelte-slate';

  export let disabled = false;
  export let style = '';
  export let noTextFormatting = false;

  const editor = withSvelte(createEditor());
  export let value = [];
</script>

<div class="text-box-container" class:disabled {style}>
  <div style="width: 100%;" class:textFormatting={!noTextFormatting}>
    <Slate {editor} bind:value>
      <Editable placeholder="Enter some plain text..." />
    </Slate>
  </div>
  <div class="text-box-underline" />
</div>

<style>
  div :global(p) {
    margin: 0;
  }
  div :global([data-svelte-editor]) {
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
  div.textFormatting :global([data-svelte-editor]) {
    color: var(--fds-text-primary);
    font-family: var(--fds-font-family-text);
    font-size: var(--fds-body-font-size);
    font-weight: 400;
    line-height: 20px;
  }
  div :global([data-svelte-editor])::-moz-placeholder {
    -moz-user-select: none;
    user-select: none;
  }
  div.textFormatting :global([data-svelte-editor])::-moz-placeholder {
    color: var(--fds-text-secondary);
  }
  div :global([data-svelte-editor]):-ms-input-placeholder {
    -ms-user-select: none;
    user-select: none;
  }
  div.textFormatting :global([data-svelte-editor]):-ms-input-placeholder {
    color: var(--fds-text-secondary);
  }
  div :global([data-svelte-editor])::placeholder {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  div.textFormatting :global([data-svelte-editor])::placeholder {
    color: var(--fds-text-secondary);
  }
  div :global([data-svelte-editor])::-webkit-search-cancel-button,
  div :global([data-svelte-editor])::-webkit-search-decoration,
  div :global([data-svelte-editor])::-webkit-search-results-button,
  div :global([data-svelte-editor])::-webkit-search-results-decoration {
    -webkit-appearance: none;
  }
  div :global([data-svelte-editor])::-ms-reveal {
    display: none;
  }
  div :global([data-svelte-editor]):disabled {
    color: var(--fds-text-disabled);
  }
  div :global([data-svelte-editor]):disabled::-moz-placeholder {
    color: var(--fds-text-disabled);
  }
  div :global([data-svelte-editor]):disabled:-ms-input-placeholder {
    color: var(--fds-text-disabled);
  }
  div :global([data-svelte-editor]):disabled::placeholder {
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
  .text-box-container:focus-within div :global([data-svelte-editor])::-moz-placeholder {
    color: var(--fds-text-tertiary);
  }
  .text-box-container:focus-within div :global([data-svelte-editor]):-ms-input-placeholder {
    color: var(--fds-text-tertiary);
  }
  .text-box-container:focus-within div :global([data-svelte-editor])::placeholder {
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
