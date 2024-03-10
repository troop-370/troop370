<script lang="ts">
  import WordCountDialog from '$lib/dialogs/WordCountDialog.svelte';
  import { debounce } from '$utils';
  import less from 'less';
  import Blocks from './_Blocks.svelte';

  export let disabled = false;
  export let value = [
    {
      type: 'paragraph',
      children: [{ text: 'This is editable!!' }],
    },
  ];

  let tiptapwidth = 0;
  let docStatsDialogOpen = false;

  let blocksContentElem: HTMLDivElement;

  // update the word count (debounced) whenever the value changes
  let wordCount = 0;
  let charCount = 0;
  $: {
    value;
    debouncedUpdateWordCount();
  }
  function updateWordCount() {
    wordCount = blocksContentElem?.textContent?.trim().split(/\s+/).length || 0;
    charCount = blocksContentElem?.textContent?.length || 0;
  }
  const debouncedUpdateWordCount = debounce(updateWordCount, 1000);

  const parsedCss = less.render(
    `
      div.blocks-content {

        .text-box-container {
          // background-color: white !important;
          border-radius: var(--fds-control-corner-radius);
        }

        [data-svelte-editor] {
          padding-block: 0;
          padding-inline: 0;

          *::selection {
            background-color: #c4dffc;
          }

          // only use bottom margin for paragraphs
          p {
            margin-top: 0;
            margin-bottom: 10px;
          }

          // no paragraph margin for list items
          li > p {
            margin-bottom: 0;
          }

          // show placeholder message when the editor is empty
          p.is-empty:first-of-type::before {
            content: attr(data-placeholder);
            float: left;
            pointer-events: none;
            height: 0;
          }
          addition {
            color: #d0021b;
            border-bottom: 1px solid #d0021b;
          }

          // title and subtitle
          h1.title {
            font-size: 48px;
            font-weight: 400;
            margin: 15px 0;
            text-align: center;
            line-height: 1.3;
          }
          p.subtitle {
            font-size: 18px;
            text-align: center;
            margin: 15px 0;
          }
          h1.title + p.subtitle {
            font-size: 18px;
            text-align: center;
            margin-top: -15px;
          }

          // hanging indent paragraph
          p.hanging {
            padding-left: 20px;
            text-indent: -20px;
          }

          // tables
          table {
            border-collapse: collapse;
            margin: 0;
            overflow: hidden;
            table-layout: fixed;
            width: 100%;

            td,
            th {
              border: 2px solid #ced4da;
              box-sizing: border-box;
              min-width: 1em;
              position: relative;
              vertical-align: top;

              > * {
                margin-bottom: 0;
              }
            }

            th {
              background-color: #f1f3f5;
              font-weight: bold;
              text-align: left;
            }

            .selectedCell:after {
              background: rgba(200, 200, 255, 0.4);
              content: '';
              left: 0;
              right: 0;
              top: 0;
              bottom: 0;
              pointer-events: none;
              position: absolute;
              z-index: 2;
            }

            .column-resize-handle {
              background-color: #adf;
              bottom: -2px;
              position: absolute;
              right: -2px;
              pointer-events: none;
              top: 0;
              width: 4px;
            }

            p {
              margin: 0;
            }
          }

          .tableWrapper {
            padding: 10px 0;
            overflow-x: auto;
          }

          &.resize-cursor {
            cursor: ew-resize;
            cursor: col-resize;
          }
        }
      }
    `
  );
</script>

{#await parsedCss then { css }}
  {@html `<` + `style>${css}</style>`}
{/await}

<div class="blocks" bind:clientWidth={tiptapwidth}>
  <!-- Ribbon -->

  <div class="main-middle">
    <!-- {#if $richTextParams.obj.previewMode > 0}
      <PreviewFrame src={dynamicPreviewHref} {fullSharedData} />
    {/if}
    <div class="blocks-content" class:hidden={$richTextParams.obj.previewMode > 0}> -->
    <div class="blocks-content" bind:this={blocksContentElem}>
      <!-- <div class="notices">
        {#if $richTextParams.isActive('fs')}
          <slot name="alerts" />
        {/if}
      </div> -->
      <!-- {#if options?.metaFrame && $richTextParams.isActive('fs')}
        <MetaFrame src={options.metaFrame} {tiptapwidth} {fullSharedData} bind:iframehtmlstring />
      {/if} -->
      <div
        style="
          max-width: {tiptapwidth <= 680 ? `unset` : `768px`};
          width: {tiptapwidth <= 680 ? `100%` : `calc(100% - 40px)`};
          box-sizing: border-box;
          background-color: white;
          border: {tiptapwidth <= 680 ? `none` : `1px solid rgb(171, 171, 171)`};
          padding: {tiptapwidth <= 680 ? `24px 20px` : `68px 88px`};
          margin: {tiptapwidth <= 680 ? `0 auto` : `20px auto`};
        "
      >
        <Blocks
          bind:value
          {disabled}
          style="background: none !important; box-shadow: none !important;"
          noTextFormatting
        />
      </div>
    </div>

    <!-- Sidebar -->
  </div>

  {#if tiptapwidth > 400}
    <div class="footer-wrapper">
      <div class="footer">
        <button
          class="footer-textblock"
          {disabled}
          on:click={() => (docStatsDialogOpen = !docStatsDialogOpen)}
        >
          {wordCount} word{wordCount !== 1 ? 's' : ''}
        </button>
        <!-- svelte-ignore missing-declaration -->
        <div class="footer-textblock">
          <!-- {packageJson.dependencies['@tiptap/core']} -->
          <!-- {'__'} -->
          v{__APP_VERSION__}
        </div>
      </div>
    </div>
  {/if}
</div>

<WordCountDialog {wordCount} {charCount} bind:open={docStatsDialogOpen} />

<style>
  .blocks {
    background-color: var(--titlebar-bg);
    color: black;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 500px;
    overflow: hidden;
    border-radius: var(--fds-control-corner-radius);
    border: 2px solid var(--titlebar-bg);
  }

  .main-middle {
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    width: 100%;
    height: 1px;
  }

  .blocks-content {
    overflow: auto;
    width: 100%;
    flex-grow: 1;
    scroll-behavior: smooth;
  }

  /* .blocks-content.hidden {
    display: none;
  } */

  /* .blocks.fullscreen {
    position: absolute !important;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    height: 100%;
    border-radius: 0;
    z-index: 99;
    background-color: var(--titlebar-bg);
    border: none;
  }

  .blocks.fullscreen :global(.text-box-container) {
    border: none;
  } */

  .footer-wrapper {
    width: 100%;
    padding: 0 8px;
    box-sizing: border-box;
  }

  .footer {
    display: flex;
    flex-shrink: 0;
    position: relative;
    width: 100%;
    max-width: 100vw;
    padding: 0px 12px;
    height: 24px;
    border: 1px solid var(--fds-divider-stroke-default);
    box-sizing: border-box;
    overflow: hidden;
    background-color: var(--titlebar-bg);
    color: var(--fds-text-secondary);
    border-radius: var(--fds-control-corner-radius) var(--fds-control-corner-radius) 0 0;
    font-size: 12px;
    line-height: 24px;
  }

  .footer-textblock {
    height: 24px;
    background-color: transparent;
    color: var(--fds-text-secondary);
    padding: 0px 4px 2px;
    border: 1px solid transparent;
    display: inline-flex;
    text-decoration: none;
    border-radius: 0px;
    min-width: 40px;
    user-select: none;
    box-sizing: border-box;
    font-weight: 400;
    cursor: default;
    font-size: 12px;
    font-family: var(--fds-font-family-small);
    align-items: center;
  }

  button.footer-textblock:hover {
    background-color: var(--fds-subtle-fill-secondary);
  }
  button.footer-textblock:active {
    background-color: var(--fds-subtle-fill-tertiary);
    color: var(--fds-text-secondary);
  }
  button.footer-textblock:focus-visible {
    box-shadow: var(--fds-focus-stroke);
  }

  /* .sidebar-wrapper {
    --sidebarmargin: 8px;
    width: 300px;
    flex-shrink: 0;
    background-color: var(--fds-solid-background-quarternary);
    margin: var(--sidebarmargin) var(--sidebarmargin) var(--sidebarmargin) 0;
    border-radius: var(--fds-control-corner-radius);
    transition: width 120ms;
    display: flex;
    flex-direction: row;
    color: var(--fds-text-primary);
    position: relative;
  }
  .sidebar-wrapper.navActive {
    width: 340px;
  }
  .sidebar-wrapper.hidden {
    width: 0px;
    margin: 0;
  }

  .sidebar-content {
    height: 100%;
    overflow: auto;
    width: 299px;
    position: absolute;
    left: 0px;
  }
  .sidebar-content-placeholder {
    width: 299px;
  }
  .sidebar-wrapper.hidden .sidebar-content {
    display: none;
  }

  .sidebar-bar {
    display: inline-flex;
    align-items: center;
    margin: 10px 0;
    width: 1px;
    background-color: var(--fds-control-strong-fill-disabled);
    opacity: 0.4;
  }
  @media (resolution: 144dpi) {
    .sidebar-bar {
      width: 0.67px;
    }
  }

  .sidebar-nav {
    width: 40px;
    flex-grow: 0;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 10px 4px 10px 4px;
    gap: 4px;
    box-sizing: border-box;
  }

  .sidebar-nav :global(.icon-button.active::before) {
    content: '';
    background-color: var(--fds-accent-default);
    height: 16px;
    width: 2.4px;
    position: absolute;
    left: -4px;
    border-radius: 6px;
    transition: all 150ms cubic-bezier(0.17, 0.17, 0, 1) 0s;
  }
  .sidebar-nav :global(.icon-button.active:hover::before) {
    height: 100%;
  } */

  :global(.button.disabled svg) {
    opacity: 0.4;
  }

  /* .notices {
    margin: 8px;
  } */
</style>
