<script lang="ts">
  import { tick } from 'svelte';

  export let style = '';
  export let disabled = false;
  export let value = '';

  let className = '';
  export { className as class };

  let height = '1px';
  let textareaElem: HTMLTextAreaElement;
  $: if (textareaElem) handleChange(value);

  function handleChange(value: string) {
    height = `1px`;
    tick().then(() => {
      height = `${textareaElem.scrollHeight}px`;
      textareaElem.focus();
    });
  }
</script>

<div class="text-box-container {className}" class:disabled {style}>
  <textarea bind:value bind:this={textareaElem} style="height: {height};" on:blur on:focus />
  <div class="text-box-underline" />
</div>

<style>
  textarea {
    background: none;
    border: none;
    width: 100%;
    background-color: transparent;
    border: none;
    border-radius: var(--fds-control-corner-radius);
    box-sizing: border-box;
    cursor: unset;
    flex: 1 1 auto;
    font-family: var(--fds-font-family-text);
    font-size: var(--fds-body-font-size);
    font-weight: 400;
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
    resize: none;
    overflow-y: hidden;
  }
  textarea:focus {
    outline: none;
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
