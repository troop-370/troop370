<script lang="ts">
  import { beforeNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { motionMode } from '$stores/motionMode';
  import { titlebarActions } from '$stores/titlebarActions';
  import { debounce } from '$utils';
  import { SetDocAttrStep } from '$utils/SetDocAttrStep';
  import type { Editor } from '@tiptap/core';
  import { IconButton, InfoBar, TextBlock, Tooltip } from 'fluent-svelte';
  import less from 'less';
  import { createEventDispatcher, onDestroy, onMount, type ComponentProps } from 'svelte';
  import { expoOut } from 'svelte/easing';
  import type { Readable } from 'svelte/store';
  import { fly } from 'svelte/transition';
  import { Transaction } from 'yjs';
  import type {
    Action,
    DocDataStore,
  } from '../../../routes/(admin)/poptart/cms/collection/[uid]/[documentId]/+page';
  import type Sidebar from '../../../routes/(admin)/poptart/cms/collection/[uid]/[documentId]/Sidebar.svelte';
  import BubbleMenuParagraph from './BubbleMenuParagraph.svelte';
  import MetaFrame from './MetaFrame.svelte';
  import PreviewFrame from './PreviewFrame.svelte';
  import Ribbon from './Ribbon.svelte';
  import Tiptap from './Tiptap.svelte';
  import WordCountDialog from './dialogs/WordCountDialog.svelte';
  import { editorExtensions } from './editorExtensions';
  import { richTextParams } from './richTextParams';
  import CommentsSidebar from './sidebars/CommentsSidebar.svelte';
  import DocPropsSidebar from './sidebars/DocPropsSidebar.svelte';
  import SidebarHeader from './sidebars/SidebarHeader.svelte';
  import VersionsSidebar from './sidebars/VersionsSidebar.svelte';
  import type { tiptapOptions } from './tiptapOptions';

  export let ydoc: ComponentProps<Tiptap>['ydoc'];
  export let ydocKey: ComponentProps<Tiptap>['ydocKey'];
  export let disabled: ComponentProps<Tiptap>['disabled'];
  export let hiddenUI = false;
  export let user: ComponentProps<Tiptap>['user'];
  export let options: tiptapOptions | undefined = undefined;
  export let fullscreen = false;
  export let fullSharedData: Readable<Record<string, unknown>>;
  // TODO: hide relevant sidebar parts and buttons if this is undefined
  export let coreSidebarProps: ComponentProps<Sidebar> | undefined = undefined;
  export let dynamicPreviewHref = '';
  export let actions: Action[] = [];
  export let docData: DocDataStore | undefined = undefined;

  export let docPropertiesSidebarProps:
    | Pick<
        ComponentProps<DocPropsSidebar>,
        'sessionAdminToken' | 'defs' | 'docDataStore' | 'variant'
      >
    | undefined = undefined;

  const dispatch = createEventDispatcher<{
    transaction: { attrs: Record<string, unknown>; content: any; type: unknown } | null;
  }>();

  $: isManaged = options?.features;

  let bubbleMenuParagraph: HTMLDivElement;

  const randomClass = 'c' + Math.random().toString(36).substring(7);
  $: parsedCss = less.render(
    `
      div.richtiptap-content.${randomClass} {

        .text-box-container {
          // background-color: white !important;
          border-radius: var(--fds-control-corner-radius);
        }

        .ProseMirror {
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
            color: var(--color-neutral-light-600);
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
    
        ${(() => {
          if (options?.css?.indexOf('.ProseMirror') === 0) {
            return options.css.replaceAll('\\r\\n', '').replaceAll('\\n', '');
          }
          return '';
        })()}
      }
    `
  );

  let tiptapwidth = 0;
  $: editorAreaWidth = tiptapwidth - ($richTextParams.primaryActive ? 300 : 0);
  let editor: Editor | null;

  interface IYSettingsMap {
    trackChanges?: boolean;
    collection: string;
  }

  // track whether track changes is enabled
  $: ySettingsMap = $ydoc?.getMap<IYSettingsMap>('__settings');

  let trackChanges: boolean | undefined;
  $: trackChanges = ySettingsMap.get('trackChanges') ?? undefined;
  $: {
    // if another editor changes the track changes setting, update the variable
    ySettingsMap?.observe(() => {
      trackChanges = ySettingsMap.get('trackChanges') ?? undefined;
    });
  }
  $: {
    // when `trackChanges` is changed in the variable, also set it in the document attributes.
    // the document attributes do not sync, but they are available to tiptap extensions.
    if (editor && editor?.state.doc.attrs.trackChanges !== trackChanges) {
      editor.state.tr.step(new SetDocAttrStep('trackChanges', trackChanges));
      editor.view?.dispatch(editor.state.tr);
    }
  }

  // make the tiptap field options available to the transformers extension,
  // which ransforms the document on modification to ensure it respects
  // which features are enabled
  $: if (
    editor &&
    options &&
    JSON.stringify(editor.storage.transformers.fieldOptions) !== JSON.stringify(options)
  ) {
    editor.commands.setFieldOptions(options);
  }

  function toggleTrackChanges(bool: boolean) {
    if (!options?.features.trackChanges && !trackChanges) return;
    ySettingsMap?.set('trackChanges', bool);
  }

  // fire the change event when the document changes
  const handleEditorChange = ({ transaction }: { transaction: Transaction }) => {
    dispatch('transaction', (transaction.doc.toJSON() as any) ?? null);
  };
  const debouncedHandleEditorChange = debounce(handleEditorChange, 300);
  const isListeningForChange = false;
  $: {
    if (editor && !isListeningForChange) {
      editor.on('update', debouncedHandleEditorChange);
    }
  }
  onDestroy(() => {
    if (editor) {
      editor.off('update', debouncedHandleEditorChange);
    }
  });

  // set the editor div class
  // $: if (editor) {
  //   editor.setOptions({ editorProps: { attributes: { class:  } } })
  // }

  let docStatsDialogOpen = false;

  $: saveAction = actions.find((action) => action.id === 'save');
  $: if (fullscreen) {
    titlebarActions.set([
      {
        label: 'Undo',
        icon: 'ArrowUndo20Regular',
        disabled: !editor?.can().undo(),
        action: () => editor?.chain().focus().undo().run(),
      },
      {
        label: 'Redo',
        icon: 'ArrowRedo20Regular',
        disabled: !editor?.can().redo(),
        action: () => editor?.chain().focus().redo().run(),
      },
      {
        label: 'Save',
        icon: 'Save20Regular',
        action: saveAction ? saveAction.action : () => {},
        disabled: saveAction?.disabled ?? true,
        size: 20,
      },
      {
        label: 'Track changes',
        icon: '',
        iconHtml: `
            <svg
              height='100%'
              width='100%'
              viewBox='0,0,2048,2048'
              focusable='false'
              fill='currentColor'
            >
              <path
                type='path'
                d='M 921 717 h -307 v -103 h 307 m 284 410 h -386 v -102 h 409 v 79 m -330 330 h -284 v -102 h 386 m -454 717 h -239 v -1844 h 920 l 456 456 q -15 10 -29 21 q -14 10 -27 23 l -115 115 h -387 v -512 h -716 v 1638 h 177 m 642 -1229 h 366 l -366 -366 m 511 1108 v 590 h -594 l 103 -103 h 389 v -386 m 351 -783 q 30 30 45 68 q 15 38 15 77 q 0 40 -15 78 q -15 37 -45 67 l -916 910 l -454 167 l 183 -468 l 898 -899 q 29 -29 67 -44 q 38 -15 77 -15 q 40 0 78 15 q 37 15 67 44 m -1064 921 q 90 53 145 144 l 759 -759 l -145 -145 m -889 1032 l 190 -69 q -43 -76 -119 -119 m 1051 -787 q 15 -15 23 -33 q 7 -19 7 -39 q 0 -21 -8 -39 q -8 -19 -22 -33 q -15 -15 -33 -23 q -19 -8 -40 -8 q -20 0 -38 8 q -19 7 -34 22 l -16 16 l 145 144 z'
              ></path>
              <path
                type='path'
                fill='transparent'
                d='M 569 1886 h -211 v -1732 h 840 l 443 436 q -3 3 -7 6 q -4 2 -7 6 l -913 914 m 974 -110 v 480 h -483 z'
              ></path>
              <path
                type='path'
                d='M 921 717 h -307 v -103 h 307 m 284 410 h -386 v -102 h 409 v 79 m -330 330 h -284 v -102 h 386 z'
              ></path>
              <path
                type='path'
                d='M 546 1946 h -239 v -1844 h 920 l 456 456 q -15 10 -29 21 q -14 10 -27 23 l -115 115 h -387 v -512 h -716 v 1638 h 177 m 642 -1229 h 366 l -366 -366 m 511 1108 v 590 h -594 l 103 -103 h 389 v -386 z'
              ></path>
              <path
                type='path'
                fill='transparent'
                d='M 820 1634 q 240 -270 448 -482 q 59 -60 119 -119 q 60 -60 118 -113 q 57 -54 111 -100 q 53 -46 99 -79 q 45 -34 82 -53 q 36 -19 60 -19 q 8 0 12 1 q 41 11 68 28 q 26 17 41 37 q 15 20 21 42 q 6 21 6 41 q 0 17 -3 33 q -3 15 -7 26 q -4 13 -9 25 l -957 950 z'
              ></path>
              <path type='path' d='M 837 1609 q 77 27 134 84 q 56 57 83 133 l -362 145 z'></path>
              <path
                type='path'
                d='M 1988 674 q 30 30 45 68 q 15 38 15 77 q 0 40 -15 78 q -15 37 -45 67 l -916 910 l -454 167 l 183 -468 l 898 -899 q 29 -29 67 -44 q 38 -15 77 -15 q 40 0 78 15 q 37 15 67 44 m -1064 921 q 90 53 145 144 l 759 -759 l -145 -145 m -889 1032 l 190 -69 q -43 -76 -119 -119 m 1051 -787 q 15 -15 23 -33 q 7 -19 7 -39 q 0 -21 -8 -39 q -8 -19 -22 -33 q -15 -15 -33 -23 q -19 -8 -40 -8 q -20 0 -38 8 q -19 7 -34 22 l -16 16 l 145 144 z'
              ></path>
            </svg>
          `,
        disabled: !editor || !options?.features.trackChanges || trackChanges === undefined,
        active: trackChanges,
        action: () => toggleTrackChanges(!trackChanges),
      },
    ]);
  } else {
    if (!hiddenUI) titlebarActions.set([]);
  }

  onDestroy(() => {
    if (!hiddenUI) titlebarActions.set([]);
  });

  onMount(() => {
    if (hiddenUI && disabled) {
      // the editor is probably a blocks editor
      return;
    }
    $richTextParams.forceUpdate();
  });

  beforeNavigate(({ from, to, complete }) => {
    if (from?.url.pathname !== to?.url.pathname) {
      // ensure that the richtextparams are cleared when navigating away
      // since the fs=force param will cause fields to be hidden if the
      // next page does not have a tiptap field
      complete.then(() => {
        $richTextParams.forceUpdate();
      });
    }
  });

  $: [themeField, themeFieldDef] = $page?.data?.defs?.find(([field, def]) => {
    if (def.type === 'enumeration' && def.label === 'Theme [[body:theme]]') {
      return true;
    }
    return false;
  }) || [undefined, undefined];
  $: theme = $docData?.[themeField] || themeFieldDef?.default || 'default';

  $: if (editor) {
    editor.setOptions({
      editorProps: {
        attributes: {
          class: `theme--${theme}`,
        },
      },
    });
  }

  $: delay = $motionMode === 'reduced' ? 0 : 130;
  $: duration = $motionMode === 'reduced' ? 0 : 270;

  let iframehtmlstring = '';
</script>

{#await parsedCss then { css }}
  {@html `<` + `style>${css}</style>`}
{/await}
<div class="richtiptap" class:fullscreen class:hiddenUI bind:clientWidth={tiptapwidth}>
  {#if !hiddenUI}
    <Ribbon
      {editor}
      {options}
      {user}
      {trackChanges}
      {toggleTrackChanges}
      {iframehtmlstring}
      {actions}
      {disabled}
      bind:docStatsDialogOpen
      {docData}
    />
  {/if}
  <div class="main-middle">
    {#if $richTextParams.obj.previewMode > 0 && !hiddenUI}
      <PreviewFrame src={dynamicPreviewHref} {fullSharedData} />
    {/if}
    <div
      class="richtiptap-content {randomClass}"
      class:hidden={$richTextParams.obj.previewMode > 0 && !hiddenUI}
    >
      {#if !hiddenUI}
        <div class="notices">
          {#if isManaged && tiptapwidth > 400}
            <InfoBar
              severity="information"
              title="Some features are managed by your administrator and may be disabled."
            />
          {/if}
          {#if $richTextParams.isActive('fs')}
            <slot name="alerts" />
          {/if}
        </div>
      {/if}
      {#if options?.metaFrame && !hiddenUI}
        <div style={`display: ${$richTextParams.isActive('fs') ? 'block' : 'none'}`}>
          <MetaFrame
            src={options.metaFrame}
            {editorAreaWidth}
            {fullSharedData}
            bind:iframehtmlstring
          />
        </div>
      {/if}
      <div
        style="
          max-width: {editorAreaWidth <= 680 ? `unset` : `768px`};
          width: {editorAreaWidth <= 680 ? `100%` : `calc(100% - 40px)`};
          box-sizing: border-box;
          background-color: white;
          border: {editorAreaWidth <= 680 ? `none` : `1px solid rgb(171, 171, 171)`};
          padding: {editorAreaWidth <= 680 ? `24px 20px` : `68px 88px`};
          margin: {editorAreaWidth <= 680 ? `0 auto` : `20px auto`};
        "
      >
        {#key bubbleMenuParagraph}
          <Tiptap
            {disabled}
            {ydoc}
            {ydocKey}
            {user}
            extensions={editorExtensions.tiptap}
            noTextFormatting
            style="background: none !important; box-shadow: none !important;"
            bind:editor
            {bubbleMenuParagraph}
          />
        {/key}
      </div>
    </div>

    {#if tiptapwidth > 400 && !hiddenUI}
      <div
        class="sidebar-wrapper"
        class:navActive={$richTextParams.activeCount > 1}
        class:hidden={!$richTextParams.primaryActive}
      >
        {#key $richTextParams.primaryActive}
          <div class="sidebar-content" in:fly={{ y: 20, duration, easing: expoOut, delay }}>
            {#if $richTextParams.primaryActive === 'comments'}
              <CommentsSidebar {editor} {user} {options} />
            {:else if $richTextParams.primaryActive === 'props' && !!coreSidebarProps && !!docPropertiesSidebarProps}
              <DocPropsSidebar
                {disabled}
                {...docPropertiesSidebarProps}
                {coreSidebarProps}
                editorIsFullscreen={fullscreen}
                {user}
              />
            {:else if $richTextParams.primaryActive === 'versions'}
              <VersionsSidebar
                docData={coreSidebarProps?.docData}
                versions={coreSidebarProps?.versions}
              />
            {:else}
              <SidebarHeader
                on:click={() => {
                  if ($richTextParams.primaryActive) {
                    $richTextParams.set($richTextParams.primaryActive, 0);
                  }
                }}
              >
                Pane
              </SidebarHeader>
              <TextBlock style="padding: 0 16px;">
                Something went wrong while loading this pane. <br /><br />
                (<code>Pane: {$richTextParams.primaryActive}</code>)
              </TextBlock>
            {/if}
          </div>
        {/key}
        <div class="sidebar-content-placeholder" />
        {#if $richTextParams.activeCount > 1}
          <div class="sidebar-bar" />
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            class="sidebar-nav"
            on:mousedown={(evt) => {
              // cancel scroll mode on middle click
              if (evt.button === 1) {
                evt.preventDefault();
              }
            }}
          >
            {#each Object.entries($richTextParams.obj) as [key, value]}
              {#if value === 1 || value === 2 || value === 3}
                {#if key !== 'fs' && key !== 'previewMode'}
                  {@const label = (() => {
                    if (key === 'comments') return 'Comments';
                    if (key === 'props') return 'Document properties';
                    if (key === 'versions') return 'Version history';
                    return key;
                  })()}
                  <Tooltip text={label} placement="left">
                    <IconButton
                      on:click={() => $richTextParams.set(key, 1)}
                      on:auxclick={(evt) => {
                        // @ts-ignore
                        if (evt.button === 1) {
                          $richTextParams.set(key, 0);
                        }
                      }}
                      class={$richTextParams.primaryActive === key ? 'active' : ''}
                    >
                      {#if key === 'comments'}
                        <FluentIcon>
                          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
                            <path
                              type="path"
                              class="OfficeIconColors_HighContrast"
                              d="M 1920 128 v 1280 h -1024 l -512 512 v -512 h -256 v -1280 m 1664 128 h -1536 v 1024 h 256 v 331 l 331 -331 h 949 z"
                            />
                            <path
                              type="path"
                              class="OfficeIconColors_m233"
                              d="M 1920 128 v 1280 h -1024 l -512 512 v -512 h -256 v -1280 m 1664 128 h -1536 v 1024 h 256 v 331 l 331 -331 h 949 z"
                            />
                          </svg>
                        </FluentIcon>
                      {:else if key === 'props'}
                        <FluentIcon name="Database20Regular" />
                      {:else if key === 'versions'}
                        <FluentIcon>
                          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
                            <path
                              type="path"
                              d="M 1394 1413 l -45 45 l -389 -389 v -621 h 64 v 595 m 0 -915 q 124 0 239 32 q 114 32 214 90 q 99 59 181 140 q 81 82 140 181 q 58 100 90 214 q 32 115 32 239 q 0 124 -32 238 q -32 115 -90 214 q -59 100 -140 181 q -82 82 -181 140 q -100 59 -214 91 q -115 32 -239 32 q -152 0 -290 -48 q -138 -48 -250 -134 q -113 -85 -195 -202 q -82 -117 -123 -256 h 67 q 40 125 117 231 q 77 106 181 182 q 103 77 229 120 q 126 43 264 43 q 115 0 221 -30 q 106 -30 199 -84 q 92 -54 168 -130 q 76 -76 130 -169 q 54 -92 84 -198 q 30 -106 30 -221 q 0 -115 -30 -221 q -30 -106 -84 -199 q -54 -92 -130 -168 q -76 -76 -168 -130 q -93 -54 -199 -84 q -106 -30 -221 -30 q -129 0 -247 38 q -119 38 -219 105 q -100 68 -177 162 q -77 95 -124 207 h 383 v 64 h -512 v -512 h 64 v 437 q 49 -124 133 -228 q 83 -104 191 -179 q 108 -75 237 -117 q 129 -41 271 -41 z"
                            />
                            <path
                              type="path"
                              d="M 1394 1413 l -45 45 l -389 -389 v -621 h 64 v 595 m 0 -915 q 124 0 239 32 q 114 32 214 90 q 99 59 181 140 q 81 82 140 181 q 58 100 90 214 q 32 115 32 239 q 0 124 -32 238 q -32 115 -90 214 q -59 100 -140 181 q -82 82 -181 140 q -100 59 -214 91 q -115 32 -239 32 q -152 0 -290 -48 q -138 -48 -250 -134 q -113 -85 -195 -202 q -82 -117 -123 -256 h 67 q 40 125 117 231 q 77 106 181 182 q 103 77 229 120 q 126 43 264 43 q 115 0 221 -30 q 106 -30 199 -84 q 92 -54 168 -130 q 76 -76 130 -169 q 54 -92 84 -198 q 30 -106 30 -221 q 0 -115 -30 -221 q -30 -106 -84 -199 q -54 -92 -130 -168 q -76 -76 -168 -130 q -93 -54 -199 -84 q -106 -30 -221 -30 q -129 0 -247 38 q -119 38 -219 105 q -100 68 -177 162 q -77 95 -124 207 h 383 v 64 h -512 v -512 h 64 v 437 q 49 -124 133 -228 q 83 -104 191 -179 q 108 -75 237 -117 q 129 -41 271 -41 z"
                            />
                          </svg>
                        </FluentIcon>
                      {:else}
                        <FluentIcon name="Question20Regular" />
                      {/if}
                    </IconButton>
                  </Tooltip>
                {/if}
              {/if}
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>

  {#if tiptapwidth > 400 && !hiddenUI}
    <div class="footer-wrapper">
      <div class="footer">
        <button
          class="footer-textblock"
          {disabled}
          on:click={() => (docStatsDialogOpen = !docStatsDialogOpen)}
        >
          {editor?.storage.characterCount.words()} word{editor?.storage.characterCount.words() !== 1
            ? 's'
            : ''}
        </button>
        <div style="flex-grow: 1;"></div>
        <button
          class="footer-textblock"
          on:click={() => $richTextParams.set('previewMode', 0)}
          class:active={$richTextParams.obj.previewMode === 0}
          title="Document mode"
        >
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 1741 102 v 1844 h -1434 v -1844 m 1331 103 h -1228 v 1638 h 1228 m -204 -1229 h -820 v -102 h 820 m 0 410 h -820 v -103 h 820 m 0 410 h -820 v -103 h 820 m 0 410 h -820 v -102 h 820 z"
            />
            <path type="path" class="OfficeIconColors_m20" d="M 358 1894 v -1740 h 1332 v 1740 z" />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 1741 102 v 1844 h -1434 v -1844 m 1331 103 h -1228 v 1638 h 1228 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m23"
              d="M 1434 614 h -820 v -102 h 820 m 0 410 h -820 v -103 h 820 m 0 410 h -820 v -103 h 820 m 0 410 h -820 v -102 h 820 z"
            />
          </svg>
        </button>
        <button
          class="footer-textblock"
          on:click={() => $richTextParams.set('previewMode', 2)}
          class:active={$richTextParams.obj.previewMode === 2}
          title="Preview mode"
        >
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 1280 256 h 683 v 1536 h -683 q -72 0 -139 24 q -68 24 -122 84 q -19 21 -46 21 q -28 0 -46 -21 q -54 -60 -113 -84 q -59 -24 -131 -24 h -683 v -1536 h 683 q 42 0 81 15 q 38 15 74 38 q 35 23 69 50 q 33 28 65 53 h 2 q 32 -25 68 -53 q 36 -27 75 -50 q 39 -23 80 -38 q 41 -15 83 -15 m -597 1451 q 73 0 136 20 q 63 20 120 67 v -1300 q -27 -25 -56 -52 q -30 -27 -61 -50 q -32 -22 -66 -37 q -35 -14 -73 -14 h -598 v 1366 m 1792 0 v -1366 h -597 q -35 0 -69 12 q -35 13 -67 33 q -33 20 -63 44 q -30 25 -57 49 v 1303 q 57 -41 122 -58 q 65 -17 134 -17 m -512 -1024 h -512 v -86 h 512 m 0 256 v 86 h -512 v -86 m 512 256 v 86 h -512 v -86 m 512 256 v 86 h -512 v -86 m 1451 -768 v 598 h -512 v -598 m 426 86 h -341 v 426 h 341 m 86 256 v 86 h -512 v -86 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 1206 312 h 712 v 1444 h -750 l -190 113 l -223 -113 h -714 v -1444 h 695 l 240 155 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 1280 256 h 683 v 1536 h -683 q -72 0 -139 24 q -68 24 -122 84 q -19 21 -46 21 q -28 0 -46 -21 q -54 -60 -113 -84 q -59 -24 -131 -24 h -683 v -1536 h 683 q 42 0 81 15 q 38 15 74 38 q 35 23 69 50 q 33 28 65 53 h 2 q 32 -25 68 -53 q 36 -27 75 -50 q 39 -23 80 -38 q 41 -15 83 -15 m -597 1451 q 73 0 136 20 q 63 20 120 67 v -1300 q -27 -25 -56 -52 q -30 -27 -61 -50 q -32 -22 -66 -37 q -35 -14 -73 -14 h -598 v 1366 m 1792 0 v -1366 h -597 q -35 0 -69 12 q -35 13 -67 33 q -33 20 -63 44 q -30 25 -57 49 v 1303 q 57 -41 122 -58 q 65 -17 134 -17 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m23"
              d="M 768 683 h -512 v -86 h 512 m 0 256 v 86 h -512 v -86 m 512 256 v 86 h -512 v -86 m 512 256 v 86 h -512 v -86 m 1451 -768 v 598 h -512 v -598 m 426 86 h -341 v 426 h 341 m 86 256 v 86 h -512 v -86 z"
            />
          </svg>
        </button>
        <!-- svelte-ignore missing-declaration -->
        <!-- <div class="footer-textblock">
          {packageJson.dependencies['@tiptap/core']}
          {'__'}
          v{'__APP_VERSION__'}
        </div> -->
      </div>
    </div>
  {/if}
</div>

<div class="bubble-menu paragraph" bind:this={bubbleMenuParagraph}>
  <BubbleMenuParagraph {editor} {options} {user} />
</div>

<WordCountDialog {editor} bind:open={docStatsDialogOpen} />

<style>
  .richtiptap {
    background-color: var(--titlebar-bg);
    color: black;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 500px;
    overflow: hidden;
    border-radius: var(--fds-control-corner-radius);
    box-shadow: inset 0 0 0 1px var(--titlebar-bg);
  }
  .richtiptap.hiddenUI {
    background-color: var(--fds-control-fill-default);
    box-shadow: inset 0 0 0 1px var(--fds-control-stroke-default);
  }

  .main-middle {
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    width: 100%;
    height: 1px;
  }

  .richtiptap-content {
    overflow: auto;
    width: 100%;
    flex-grow: 1;
    scroll-behavior: smooth;
  }

  .richtiptap-content.hidden {
    display: none;
  }

  .richtiptap.fullscreen {
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

  .richtiptap.fullscreen :global(.text-box-container) {
    border: none;
  }

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
    justify-content: center;
  }

  .footer-textblock svg {
    height: 16px;
    width: 16px;
  }

  button.footer-textblock.active {
    background-color: var(--fds-subtle-fill-tertiary);
    color: var(--fds-text-primary);
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

  .sidebar-wrapper {
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
  }

  :global(.button.disabled svg) {
    opacity: 0.4;
  }

  .notices {
    margin: 8px;
  }
</style>
