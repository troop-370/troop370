<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import type { Editor } from '@tiptap/core';
  import { IconButton } from 'fluent-svelte';
  import type { ComponentProps } from 'svelte';
  import type { tiptapOptions } from '../../../config';
  import type Tiptap from './Tiptap.svelte';
  import { richTextParams } from './richTextParams';

  export let editor: Editor | null;
  export let visible = false;
  export let disabled = false;
  export let options: tiptapOptions | undefined = undefined;
  export let user: ComponentProps<Tiptap>['user'] | null = null;

  $: coreNewCommentAttrs = {
    color: user?.color || '',
    commenter: { name: user?.name || '', photo: user?.photo || '' },
    sessionId: user?.sessionId || '',
  };

  $: editor;

  $: boldDisabled = disabled || !editor?.can().toggleBold();
  $: italicDisabled = disabled || !editor?.can().toggleItalic();
  $: underlineDisabled = disabled || !editor?.can().toggleUnderline();
  $: strikeDisabled = disabled || !editor?.can().toggleStrike();
  $: commentDisabled = disabled || !user || !editor?.can().setComment(coreNewCommentAttrs);
  $: bulletListDisabled = disabled || !editor?.can().toggleBulletList();
  $: orderedListDisabled = disabled || !editor?.can().toggleOrderedList();
</script>

<div class="menu">
  {#if options?.features.bold}
    <IconButton
      on:click={boldDisabled ? undefined : () => editor?.chain().focus().toggleBold().run()}
      disabled={boldDisabled}
      class={editor?.isActive('bold') ? 'active' : ''}
    >
      <FluentIcon>
        <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
          <path
            type="path"
            class="OfficeIconColors_HighContrast"
            d="M 1563 1213 q 0 97 -36 175 q -36 79 -104 134 q -68 56 -165 86 q -97 30 -218 30 h -528 v -1433 h 499 q 120 0 212 23 q 92 23 155 66 q 63 44 96 107 q 32 64 32 145 q 0 55 -20 106 q -20 51 -56 93 q -37 43 -88 75 q -51 32 -113 48 v 4 q 73 9 134 38 q 61 29 106 73 q 44 45 69 103 q 25 59 25 127 m -374 -607 q 0 -39 -15 -75 q -15 -35 -44 -62 q -29 -27 -73 -43 q -45 -16 -103 -16 h -135 v 409 h 156 q 25 0 62 -13 q 36 -12 70 -38 q 33 -26 58 -66 q 24 -40 24 -96 m 59 620 q 0 -94 -61 -148 q -62 -54 -178 -54 h -190 v 410 h 188 q 52 0 96 -12 q 44 -11 76 -37 q 32 -25 50 -64 q 18 -39 19 -95 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m22"
            d="M 1563 1213 q 0 97 -36 175 q -36 79 -104 134 q -68 56 -165 86 q -97 30 -218 30 h -528 v -1433 h 499 q 120 0 212 23 q 92 23 155 66 q 63 44 96 107 q 32 64 32 145 q 0 55 -20 106 q -20 51 -56 93 q -37 43 -88 75 q -51 32 -113 48 v 4 q 73 9 134 38 q 61 29 106 73 q 44 45 69 103 q 25 59 25 127 m -374 -607 q 0 -39 -15 -75 q -15 -35 -44 -62 q -29 -27 -73 -43 q -45 -16 -103 -16 h -135 v 409 h 156 q 25 0 62 -13 q 36 -12 70 -38 q 33 -26 58 -66 q 24 -40 24 -96 m 59 620 q 0 -94 -61 -148 q -62 -54 -178 -54 h -190 v 410 h 188 q 52 0 96 -12 q 44 -11 76 -37 q 32 -25 50 -64 q 18 -39 19 -95 z"
          />
        </svg>
      </FluentIcon>
    </IconButton>
  {/if}

  {#if options?.features.italic}
    <IconButton
      on:click={italicDisabled ? undefined : () => editor?.chain().focus().toggleItalic().run()}
      disabled={italicDisabled}
      class={editor?.isActive('italic') ? 'active' : ''}
    >
      <FluentIcon>
        <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
          <path
            type="path"
            class="OfficeIconColors_HighContrast"
            d="M 1398 307 h -158 l -261 1229 h 234 l -102 102 h -563 l 102 -102 h 166 l 259 -1229 h -240 l 102 -102 h 563 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m22"
            d="M 1398 307 h -158 l -261 1229 h 234 l -102 102 h -563 l 102 -102 h 166 l 259 -1229 h -240 l 102 -102 h 563 z"
          />
        </svg>
      </FluentIcon>
    </IconButton>
  {/if}

  {#if options?.features.underline}
    <IconButton
      on:click={underlineDisabled ? undefined : () => editor?.chain().focus().toggleUnderline().run()}
      disabled={underlineDisabled}
      class={editor?.isActive('underline') ? 'active' : ''}
    >
      <FluentIcon>
        <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
          <path
            type="path"
            class="OfficeIconColors_HighContrast"
            d="M 410 1843 h 1228 v 103 h -1228 m 1126 -922 q 0 581 -523 581 q -501 0 -501 -559 v -841 h 161 v 832 q 0 422 358 422 q 344 0 344 -409 v -845 h 161 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m22"
            d="M 410 1843 h 1228 v 103 h -1228 m 1126 -922 q 0 581 -523 581 q -501 0 -501 -559 v -841 h 161 v 832 q 0 422 358 422 q 344 0 344 -409 v -845 h 161 z"
          />
        </svg>
      </FluentIcon>
    </IconButton>
  {/if}

  {#if options?.features.strike}
    <IconButton
      on:click={strikeDisabled ? undefined : () => editor?.chain().focus().toggleStrike().run()}
      disabled={strikeDisabled}
      class={editor?.isActive('strike') ? 'active' : ''}
    >
      <FluentIcon>
        <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
          <path
            type="path"
            class="OfficeIconColors_HighContrast"
            d="M 2048 1126 v 103 h -236 q -9 93 -41 169 q -33 76 -84 129 q -52 53 -120 82 q -69 29 -150 29 q -188 0 -279 -163 h -3 v 143 h -111 v -389 h -205 v 389 h -110 v -158 h -4 q -44 86 -118 132 q -74 46 -169 46 q -63 0 -114 -18 q -52 -18 -88 -51 q -36 -33 -55 -80 q -20 -46 -20 -103 q 0 -94 45 -157 h -186 v -103 h 333 q 24 -8 51 -14 q 26 -5 56 -10 l 269 -39 q 0 -255 -198 -255 q -156 0 -287 113 v -121 q 25 -19 61 -35 q 35 -16 75 -28 q 39 -12 81 -19 q 41 -6 79 -6 q 147 0 223 82 q 76 82 76 248 v 84 h 205 v -819 h 111 v 595 h 3 q 50 -93 133 -142 q 82 -48 185 -48 q 83 0 149 29 q 65 30 112 84 q 46 54 72 130 q 25 77 27 171 m -1107 117 v -14 h -375 q -41 19 -60 57 q -19 38 -19 93 q 0 37 13 67 q 13 30 37 51 q 24 22 58 34 q 34 12 76 12 q 59 0 109 -23 q 49 -23 85 -63 q 36 -40 56 -95 q 20 -55 20 -119 m 463 -275 q -37 74 -37 158 h 567 q -2 -72 -21 -131 q -20 -58 -54 -100 q -35 -41 -83 -64 q -49 -23 -110 -23 q -89 0 -158 42 q -69 43 -104 118 m 452 467 q 59 -79 74 -206 h -563 v 20 q 0 62 21 115 q 21 54 58 94 q 37 40 88 62 q 51 23 111 23 q 133 0 211 -108 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m22"
            d="M 2048 1126 v 103 h -236 q -9 93 -41 169 q -33 76 -84 129 q -52 53 -120 82 q -69 29 -150 29 q -188 0 -279 -163 h -3 v 143 h -111 v -389 h -205 v 389 h -110 v -158 h -4 q -44 86 -118 132 q -74 46 -169 46 q -63 0 -114 -18 q -52 -18 -88 -51 q -36 -33 -55 -80 q -20 -46 -20 -103 q 0 -94 45 -157 h -186 v -103 h 333 q 24 -8 51 -14 q 26 -5 56 -10 l 269 -39 q 0 -255 -198 -255 q -156 0 -287 113 v -121 q 25 -19 61 -35 q 35 -16 75 -28 q 39 -12 81 -19 q 41 -6 79 -6 q 147 0 223 82 q 76 82 76 248 v 84 h 205 v -819 h 111 v 595 h 3 q 50 -93 133 -142 q 82 -48 185 -48 q 83 0 149 29 q 65 30 112 84 q 46 54 72 130 q 25 77 27 171 m -1107 117 v -14 h -375 q -41 19 -60 57 q -19 38 -19 93 q 0 37 13 67 q 13 30 37 51 q 24 22 58 34 q 34 12 76 12 q 59 0 109 -23 q 49 -23 85 -63 q 36 -40 56 -95 q 20 -55 20 -119 m 463 -275 q -37 74 -37 158 h 567 q -2 -72 -21 -131 q -20 -58 -54 -100 q -35 -41 -83 -64 q -49 -23 -110 -23 q -89 0 -158 42 q -69 43 -104 118 m 452 467 q 59 -79 74 -206 h -563 v 20 q 0 62 21 115 q 21 54 58 94 q 37 40 88 62 q 51 23 111 23 q 133 0 211 -108 z"
          />
        </svg>
      </FluentIcon>
    </IconButton>
  {/if}

  {#if options?.features.comment}
    <span class="bar" />

    <IconButton
      on:click={() => {
        if (commentDisabled) return;
        editor?.chain().focus().setComment(coreNewCommentAttrs).run();
        $richTextParams.set('comments', 1);
      }}
      disabled={commentDisabled}
    >
      <FluentIcon>
        <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
          <path
            type="path"
            class="OfficeIconColors_HighContrast"
            d="M 0 410 h 410 v -410 h 128 v 410 h 409 v 128 h -409 v 409 h -128 v -409 h -410 m 1946 -333 v 1229 h -1022 l -514 512 v -512 h -308 v -743 h 103 v 640 h 307 v 367 l 367 -367 h 964 v -1024 h -742 v -102 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m20"
            d="M 1894 256 v 1126 h -991 l -442 440 v -440 h -307 v -691 h 153 v 410 h 384 v -410 h 410 v -435 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m22"
            d="M 1946 205 v 1229 h -1022 l -514 512 v -512 h -308 v -743 h 103 v 640 h 307 v 367 l 367 -367 h 964 v -1024 h -742 v -102 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m27"
            d="M 0 410 h 410 v -410 h 128 v 410 h 409 v 128 h -409 v 409 h -128 v -409 h -410 z"
          />
        </svg>
      </FluentIcon>
    </IconButton>
  {/if}

  {#if options?.features.bulletList || options?.features.orderedList}
    <span class="bar" />
  {/if}

  {#if options?.features.bulletList}
    <IconButton
      on:click={bulletListDisabled ? undefined : () => editor?.chain().focus().toggleBulletList().run()}
      disabled={bulletListDisabled}
      class={editor?.isActive('bulletList') ? 'active' : ''}
    >
      <FluentIcon>
        <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
          <path
            type="path"
            class="OfficeIconColors_HighContrast"
            d="M 410 410 h -308 v -308 h 308 m 0 717 v 307 h -308 v -307 m 308 717 v 307 h -308 v -307 m 1844 -512 h -1229 v -102 h 1229 m 0 -717 v 102 h -1229 v -102 m 1229 1433 v 103 h -1229 v -103 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m24"
            d="M 410 410 h -308 v -308 h 308 m 0 717 v 307 h -308 v -307 m 308 717 v 307 h -308 v -307 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m22"
            d="M 1946 1024 h -1229 v -102 h 1229 m 0 -717 v 102 h -1229 v -102 m 1229 1433 v 103 h -1229 v -103 z"
          />
        </svg>
      </FluentIcon>
    </IconButton>
  {/if}

  {#if options?.features.orderedList}
    <IconButton
      on:click={orderedListDisabled ? undefined : () => editor?.chain().focus().toggleOrderedList().run()}
      disabled={orderedListDisabled}
      class={editor?.isActive('orderedList') ? 'active' : ''}
    >
      <FluentIcon>
        <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
          <path
            type="path"
            class="OfficeIconColors_HighContrast"
            d="M 307 0 v 512 h -81 v -413 q -41 29 -105 46 v -69 q 24 -7 44 -16 q 19 -8 37 -17 q 18 -9 36 -20 q 17 -10 35 -23 m 145 1229 h -316 v -39 q 0 -45 26 -86 q 26 -41 93 -94 q 31 -25 52 -44 q 20 -18 33 -35 q 12 -16 17 -32 q 5 -15 5 -35 q 0 -38 -22 -59 q -23 -21 -60 -21 q -65 0 -125 57 v -78 q 31 -23 63 -35 q 32 -11 77 -11 q 69 0 110 35 q 40 36 40 103 q 0 32 -6 56 q -7 25 -24 48 q -17 23 -45 48 q -29 26 -72 60 q -38 30 -55 50 q -18 20 -18 38 v 4 h 227 m -11 636 q 0 68 -49 109 q -50 42 -135 42 q -32 0 -66 -8 q -35 -8 -52 -19 v -79 q 22 18 54 29 q 32 11 64 11 q 47 0 74 -22 q 27 -22 27 -60 q 0 -83 -125 -83 h -43 v -66 h 41 q 51 0 81 -19 q 30 -19 30 -59 q 0 -35 -23 -54 q -24 -18 -63 -18 q -54 0 -98 35 v -73 q 22 -12 53 -20 q 31 -7 66 -7 q 63 0 105 31 q 41 32 41 89 q 0 48 -26 79 q -26 32 -72 44 v 2 q 54 6 85 37 q 31 32 31 79 m 1539 -771 h -1229 v -102 h 1229 m 0 -717 v 102 h -1229 v -102 m 1229 1433 v 103 h -1229 v -103 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m24"
            d="M 307 0 v 512 h -81 v -413 q -41 29 -105 46 v -69 q 24 -7 44 -16 q 19 -8 37 -17 q 18 -9 36 -20 q 17 -10 35 -23 m 145 1229 h -316 v -39 q 0 -45 26 -86 q 26 -41 93 -94 q 31 -25 52 -44 q 20 -18 33 -35 q 12 -16 17 -32 q 5 -15 5 -35 q 0 -38 -22 -59 q -23 -21 -60 -21 q -65 0 -125 57 v -78 q 31 -23 63 -35 q 32 -11 77 -11 q 69 0 110 35 q 40 36 40 103 q 0 32 -6 56 q -7 25 -24 48 q -17 23 -45 48 q -29 26 -72 60 q -38 30 -55 50 q -18 20 -18 38 v 4 h 227 m -11 636 q 0 68 -49 109 q -50 42 -135 42 q -32 0 -66 -8 q -35 -8 -52 -19 v -79 q 22 18 54 29 q 32 11 64 11 q 47 0 74 -22 q 27 -22 27 -60 q 0 -83 -125 -83 h -43 v -66 h 41 q 51 0 81 -19 q 30 -19 30 -59 q 0 -35 -23 -54 q -24 -18 -63 -18 q -54 0 -98 35 v -73 q 22 -12 53 -20 q 31 -7 66 -7 q 63 0 105 31 q 41 32 41 89 q 0 48 -26 79 q -26 32 -72 44 v 2 q 54 6 85 37 q 31 32 31 79 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m22"
            d="M 1946 1024 h -1229 v -102 h 1229 m 0 -717 v 102 h -1229 v -102 m 1229 1433 v 103 h -1229 v -103 z"
          />
        </svg>
      </FluentIcon>
    </IconButton>
  {/if}
</div>

<style>
  .menu {
    height: 40px;
    background-color: var(--fds-solid-background-quarternary);
    color: var(--fds-text-primary);
    border-bottom: none;
    border-radius: var(--fds-control-corner-radius);
    box-sizing: border-box;
    box-shadow: rgba(0, 0, 0, 0.133) 0px 1.6px 3.6px 0px, rgba(0, 0, 0, 0.11) 0px 0.3px 0.9px 0px;
    padding: 4px;

    display: flex;
    justify-content: left;
    align-items: center;
    gap: 4px;
  }

  .menu :global(.button),
  .menu :global(.tooltip-wrapper > .button) {
    height: 32px;
    background-color: transparent !important;
    box-shadow: none;
  }

  .menu :global(.icon-button),
  .menu :global(.tooltip-wrapper > .icon-button) {
    width: 32px;
    height: 32px;
  }

  .menu :global(span.bar) {
    display: inline-flex;
    height: 24px;
    align-items: center;
    margin: 0px 4px;
    width: 1px;
    background-color: var(--fds-control-strong-fill-disabled);
    opacity: 0.6;
  }
  @media (resolution: 144dpi) {
    .menu :global(span.bar) {
      width: 0.67px;
    }
  }

  .menu {
    --mouse-hover: #e1dfdd;
    --mouse-active: #c8c6c4;
    --tool-active: #d2d0ce;
    --tool-active-hover: #979593;
  }
  @media (prefers-color-scheme: dark) {
    .menu {
      --mouse-hover: #484644;
      --mouse-active: #797775;
      --tool-active: #605e5c;
      --tool-active-hover: #8a8886;
    }
  }

  .menu :global(.button.active),
  .menu :global(.icon-button.active),
  .menu :global(.tooltip-wrapper > .button.active),
  .menu :global(.tooltip-wrapper > .icon-button.active) {
    background-color: var(--tool-active) !important;
    background-color: var(--mouse-hover) !important;
  }

  .menu :global(.button.active):hover:not(disabled):not(.disabled),
  .menu :global(.icon-button.active):hover:not(disabled):not(.disabled),
  .menu :global(.tooltip-wrapper > .button.active):hover:not(disabled):not(.disabled),
  .menu :global(.tooltip-wrapper > .icon-button.active):hover:not(disabled):not(.disabled) {
    box-shadow: inset 0 0 0 1px var(--tool-active-hover);
  }

  .menu :global(.button):hover:not(disabled):not(.disabled),
  .menu :global(.icon-button):hover:not(disabled):not(.disabled),
  .menu :global(.tooltip-wrapper > .button):hover:not(disabled):not(.disabled),
  .menu :global(.tooltip-wrapper > .icon-button):hover:not(disabled):not(.disabled) {
    background-color: var(--mouse-hover) !important;
  }

  .menu :global(.button):active:not(disabled):not(.disabled),
  .menu :global(.icon-button):active:not(disabled):not(.disabled),
  .menu :global(.tooltip-wrapper > .button):active:not(disabled):not(.disabled),
  .menu :global(.tooltip-wrapper > .icon-button):active:not(disabled):not(.disabled) {
    background-color: var(--mouse-active) !important;
  }

  .menu :global(.tooltip-wrapper > .button.style-standard),
  .menu :global(.button.style-standard) {
    padding-left: 6px;
    padding-right: 6px;
  }

  .menu :global(.tooltip-wrapper > .icon-button),
  .menu :global(.icon-button) {
    padding: 6px;
  }
  .menu :global(.tooltip-wrapper > .icon-button svg),
  .menu :global(.icon-button svg) {
    inline-size: 18px;
  }

  .menu :global(.tooltip-wrapper > .button.disabled svg),
  .menu :global(.tooltip-wrapper > .icon-button.disabled svg),
  .menu :global(.button.disabled svg),
  .menu :global(.icon-button.disabled svg) {
    fill: #3a3a38ff;
    opacity: 0.4;
  }
  @media (prefers-color-scheme: dark) {
    .menu :global(.tooltip-wrapper > .button.disabled svg),
    .menu :global(.tooltip-wrapper > .icon-button.disabled svg),
    .menu :global(.button.disabled svg),
    .menu :global(.icon-button.disabled svg) {
      fill: #d4d4d4ff;
    }
  }

  .menu :global(.menu-flyout-wrapper) {
    margin-right: -4px;
    height: 32px;
  }
</style>
