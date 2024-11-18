<script lang="ts">
  import { themeMode } from '$stores/themeMode';
  import loader from '@monaco-editor/loader';
  import { Button } from 'fluent-svelte';
  import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
  import rehypeStringify from 'rehype-stringify';
  import remarkParse from 'remark-parse';
  import remarkRehype from 'remark-rehype';
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import { unified } from 'unified';
  import { cristataCodeDarkTheme } from './cristataCodeDarkTheme';

  let editor: Monaco.editor.IStandaloneCodeEditor | undefined;
  let monaco: typeof Monaco | undefined;
  let model: Monaco.editor.ITextModel | undefined;
  let editorContainer: HTMLElement;

  export let disabled = false;
  export let key: string;
  export let type: 'json' | 'md' | 'css' | 'less';
  export let value: string | undefined | null = '';
  export let height = 300;
  export let style = '';

  const dispatch = createEventDispatcher<{
    change: string;
  }>();

  onMount(async () => {
    if (value === null || value === undefined) value = '';

    const monacoEditor = await import('monaco-editor');
    loader.config({ monaco: monacoEditor.default });
    monaco = await loader.init();

    monaco.editor.defineTheme('cristata-code-dark', cristataCodeDarkTheme);

    editor = monaco.editor.create(editorContainer, {
      tabSize: 2,
      theme: $themeMode === 'dark' ? 'cristata-code-dark' : 'vs',
      readOnly: disabled,
    });
    model = monaco.editor.createModel(value, type, monaco.Uri.file(`${key}.${type}`));
    editor.setModel(model);

    // handle changes
    editor.onDidChangeModelContent((evt) => {
      if (editor) value = editor.getValue();
    });
  });

  function setLanguage(_type: typeof type) {
    if (model && type) monaco?.editor.setModelLanguage(model, type);
  }
  $: setLanguage(type);

  function setValue(_value: typeof value) {
    if (editor && editor.getValue() !== value) editor.setValue(value || '');
  }
  $: setValue(value);
  $: dispatch('change', value || '');

  function setReadOnly(readOnly: boolean) {
    if (editor) editor.updateOptions({ readOnly });
  }
  $: setReadOnly(disabled);

  function setReadThemeMode(themeMode: typeof $themeMode) {
    if (editor) editor.updateOptions({ theme: themeMode === 'dark' ? 'cristata-code-dark' : 'vs' });
  }
  $: setReadThemeMode($themeMode);

  onDestroy(() => {
    model?.dispose();
  });

  let tabsContainerElement: HTMLDivElement;
  let activeTab = 'compose';
  let mouseOverActiveTab = false;
  $: ({ activeTabWidth, activeTabLeft } = (() => {
    const tabsContainerRect = tabsContainerElement?.getBoundingClientRect();
    const activeTabRect = tabsContainerElement
      ?.querySelector(`[data-tab='${activeTab}']`)
      ?.getBoundingClientRect();
    return {
      activeTabWidth: (activeTabRect?.width || 0) - (mouseOverActiveTab ? 0 : 22),
      activeTabLeft:
        (activeTabRect?.left || 0) - (tabsContainerRect?.left || 0) + (mouseOverActiveTab ? 0 : 11),
    };
  })());

  function handleTabClick(evt: CustomEvent) {
    const target = evt.target as HTMLElement | undefined;
    const clickedTabName = target?.getAttribute('data-tab');
    if (clickedTabName) {
      activeTab = clickedTabName;
      mouseOverActiveTab = true;
    }
  }

  function handleTabMouseEnter(evt: CustomEvent) {
    const target = evt.target as HTMLElement | undefined;
    const tabName = target?.getAttribute('data-tab');
    if (tabName === activeTab) mouseOverActiveTab = true;
    else mouseOverActiveTab = false;
  }

  function handleTabMouseLeave(evt: CustomEvent) {
    const target = evt.target as HTMLElement | undefined;
    const tabName = target?.getAttribute('data-tab');
    if (tabName === activeTab) mouseOverActiveTab = false;
    else mouseOverActiveTab = false;
  }

  $: previewText = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(value || '');
  $: showPreview = type === 'md' && activeTab === 'preview';
</script>

<div class="code">
  {#if type === 'md'}
    <div class="tabs" bind:this={tabsContainerElement}>
      <Button
        data-tab={'compose'}
        on:click={handleTabClick}
        on:mouseenter={handleTabMouseEnter}
        on:mouseleave={handleTabMouseLeave}
      >
        Compose
      </Button>
      <Button
        data-tab={'preview'}
        on:click={handleTabClick}
        on:mouseenter={handleTabMouseEnter}
        on:mouseleave={handleTabMouseLeave}
      >
        Preview
      </Button>
      <div class="tabline" style="width: {activeTabWidth}px; left: {activeTabLeft}px;" />
    </div>
  {/if}

  <div class="text-box-container" class:disabled={disabled || showPreview} {style}>
    {#if showPreview}
      <div
        class="md-preview-container"
        style="
          --height: {height}px;
        "
      >
        {#await previewText}
          Loading...
        {:then result}
          {@html result}
        {:catch error}
          <p style="color: red">{error.message}</p>
        {/await}
      </div>
    {/if}
    <div
      class="container"
      class:hide={showPreview}
      bind:this={editorContainer}
      style="
        --height: {height}px;
      "
    />
    <div class="text-box-underline" />
  </div>
</div>

<style>
  .code {
    position: relative;
  }

  .container {
    width: 100%;
    height: var(--height);
    box-sizing: border-box;
    padding: 1px;
  }
  .container.hide {
    display: none;
  }

  .md-preview-container {
    width: 100%;
    height: var(--height);
    box-sizing: border-box;
    padding-inline: 10px;
    padding-block: 5px;
    overflow: auto;
  }

  @media (prefers-color-scheme: light) {
    .container :global(.monaco-editor .margin),
    .container :global(.monaco-editor),
    .container :global(.monaco-editor-background),
    .container :global(.monaco-editor .inputarea.ime-input) {
      background: none;
    }
  }

  .container :global(.monaco-editor .margin) {
    border-radius: var(--fds-control-corner-radius) 0 0 var(--fds-control-corner-radius);
  }

  .container :global(.monaco-editor),
  .container :global(.monaco-editor-background),
  .container :global(.monaco-editor .inputarea.ime-input) {
    border-radius: var(--fds-control-corner-radius);
  }

  .container :global(.decorationsOverviewRuler) {
    margin: 0 2px 0 0;
    border-radius: 0 var(--fds-control-corner-radius) var(--fds-control-corner-radius) 0;
  }

  .container :global(.minimap.slider-mouseover) {
    margin: 1px 0 1px 0;
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

  .tabs {
    position: relative;
    display: flex;
    flex-direction: row;
    height: 30px;
    -webkit-app-region: no-drag;
    app-region: no-drag;
  }

  .tabs :global(.button.style-standard) {
    background-color: transparent;
    box-shadow: none;
    padding-left: 11px;
    padding-right: 11px;
  }

  .tabs :global(.button.style-standard):hover:not(disabled):not(.disabled) {
    background-color: var(--fds-subtle-fill-secondary);
  }

  .tabs :global(.button.style-standard):active:not(disabled):not(.disabled) {
    background-color: var(--fds-subtle-fill-tertiary);
    color: var(--fds-text-secondary);
  }

  .tabs :global(.button.style-standard[data-contextual='true']) {
    color: var(--fds-accent-default);
  }

  .tabline {
    margin: 0px;
    bottom: 0px;
    left: 111.573px;
    width: 58.625px;
    height: 2.4px;
    pointer-events: none;
    position: absolute;
    transition: all 150ms cubic-bezier(0.17, 0.17, 0, 1) 0s;
    float: left;
    background-color: var(--fds-accent-default);
    border-radius: 6px;
  }
</style>
