<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import LinkDialog from '$lib/dialogs/LinkDialog.svelte';
  import PhotoWidgetDialog from '$lib/dialogs/PhotoWidgetDialog.svelte';
  import YoutubeVideoIdDialog from '$lib/dialogs/YoutubeVideoIdDialog.svelte';
  import type { Editor } from '@tiptap/core';
  import { Button, IconButton, MenuFlyout, MenuFlyoutItem, Tooltip } from 'fluent-svelte';
  import type { ComponentProps } from 'svelte';
  import type { tiptapOptions } from '../../../../config';
  import type Tiptap from '../Tiptap.svelte';
  import { richTextParams } from '../richTextParams';

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

  let widgetsMenuOpen = false;
  let insertYoutubeWidgetDialogOpen = false;
  let insertPhotoWidgetDialogOpen = false;
  let insertLinkDialogOpen = false;

  let width = 1000;

  $: previewMode = $richTextParams.obj.previewMode > 0;
  $: hrDisabled =
    disabled || previewMode || !options?.features.horizontalRule || !editor?.can().setHorizontalRule();
  $: photoDisabled =
    disabled || previewMode || !options?.features.widgets?.photoWidget || !editor?.can().insertPhotoWidget('');
  $: ytDisabled =
    disabled || previewMode || !options?.features.widgets?.youtube || !editor?.can().insertYoutubeWidget('');
  $: sweepWidgetDisabled = disabled || previewMode || true;
  $: widgetsDisabled = ytDisabled && sweepWidgetDisabled;
  $: linkDisabled = disabled || previewMode || !options?.features.link || !editor?.can().setLink({ href: '' });
  $: pullQuoteDisabled =
    disabled || previewMode || !options?.features.pullQuote || !editor?.can().insertPullQuote();
  $: tablesDisabled = disabled || previewMode || !options?.features.tables || !editor?.can().insertTable();
  $: setCommentDisabled =
    disabled ||
    previewMode ||
    !options?.features.comment ||
    !user ||
    !editor?.can().setComment(coreNewCommentAttrs);
  $: unsetCommentDisabled =
    disabled || previewMode || !options?.features.comment || !editor?.can().unsetComment();
</script>

<div class="panel" class:visible bind:offsetWidth={width}>
  {#if width > 500}
    <Button
      on:click={hrDisabled ? undefined : () => editor?.chain().focus().setHorizontalRule().run()}
      disabled={hrDisabled}
    >
      <FluentIcon mode="ribbonButtonIconLeft">
        <svg
          fill="currentColor"
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M2 9.5c0-.28.22-.5.5-.5h15a.5.5 0 010 1h-15a.5.5 0 01-.5-.5z" fill="currentColor" />
        </svg>
      </FluentIcon>
      Horizontal Line
    </Button>
  {:else}
    <Tooltip text="Horizontal line" alignment="start">
      <IconButton
        on:click={hrDisabled ? undefined : () => editor?.chain().focus().setHorizontalRule().run()}
        disabled={hrDisabled}
      >
        <FluentIcon>
          <svg
            fill="currentColor"
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M2 9.5c0-.28.22-.5.5-.5h15a.5.5 0 010 1h-15a.5.5 0 01-.5-.5z" fill="currentColor" />
          </svg>
        </FluentIcon>
      </IconButton>
    </Tooltip>
  {/if}

  <PhotoWidgetDialog
    bind:open={insertPhotoWidgetDialogOpen}
    handleSumbit={async (photoId) => {
      if (photoDisabled) return;
      editor?.chain().focus().insertPhotoWidget(photoId).run();
    }}
  />
  {#if width > 640}
    <Button
      disabled={photoDisabled}
      on:click={photoDisabled ? undefined : () => (insertPhotoWidgetDialogOpen = !insertPhotoWidgetDialogOpen)}
    >
      <FluentIcon mode="ribbonButtonIconLeft">
        <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
          <path
            type="path"
            class="OfficeIconColors_HighContrast"
            d="M 1485 794 q -27 0 -50 -10 q -23 -10 -40 -28 q -18 -17 -28 -41 q -10 -23 -10 -49 q 0 -27 10 -50 q 10 -23 28 -41 q 17 -17 40 -27 q 23 -10 50 -10 q 26 0 50 10 q 23 10 41 27 q 17 18 27 41 q 10 23 10 50 q 0 26 -10 49 q -10 24 -27 41 q -18 18 -41 28 q -24 10 -50 10 m -1383 -487 h 1844 v 1434 h -1844 m 1741 -1331 h -1638 v 746 l 461 -460 l 563 563 l 256 -256 l 358 358 m -1638 -60 v 337 h 1259 l -798 -798 m 942 798 h 235 v -132 l -358 -358 l -184 183 z"
          />
          <path type="path" class="OfficeIconColors_m20" d="M 1894 1690 h -1740 v -1332 h 1740 z" />
          <path
            type="path"
            class="OfficeIconColors_m26"
            d="M 152 1278 l 514 -504 l 569 549 l 250 -246 l 413 401 v 211 h -1746 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m25"
            d="M 1858 1521 l -373 -373 l -184 183 l 322 322 l -72 73 l -885 -886 l -476 476 l -73 -72 l 549 -548 l 563 563 l 256 -256 l 446 446 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m2226"
            d="M 1485 794 q -27 0 -50 -10 q -23 -10 -40 -28 q -18 -17 -28 -41 q -10 -23 -10 -49 q 0 -27 10 -50 q 10 -23 28 -41 q 17 -17 40 -27 q 23 -10 50 -10 q 26 0 50 10 q 23 10 41 27 q 17 18 27 41 q 10 23 10 50 q 0 26 -10 49 q -10 24 -27 41 q -18 18 -41 28 q -24 10 -50 10 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m2227"
            d="M 1459 653 q 0 44 17 83 q 16 39 45 68 q 29 30 68 47 q 38 18 82 19 q -27 24 -61 38 q -35 14 -74 14 q -42 0 -79 -16 q -38 -16 -66 -44 q -28 -28 -44 -66 q -16 -37 -16 -79 q 0 -39 14 -74 q 14 -34 38 -61 q 24 -27 57 -45 q 32 -17 70 -22 q -23 28 -37 63 q -14 35 -14 75 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m22"
            d="M 102 307 h 1844 v 1434 h -1844 m 1741 -103 v -1228 h -1638 v 1228 z"
          />
        </svg>
      </FluentIcon>
      Photo
    </Button>
  {:else}
    <Tooltip text="Insert photo">
      <IconButton
        disabled={photoDisabled}
        on:click={photoDisabled
          ? undefined
          : () => (insertPhotoWidgetDialogOpen = !insertPhotoWidgetDialogOpen)}
      >
        <FluentIcon>
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 1485 794 q -27 0 -50 -10 q -23 -10 -40 -28 q -18 -17 -28 -41 q -10 -23 -10 -49 q 0 -27 10 -50 q 10 -23 28 -41 q 17 -17 40 -27 q 23 -10 50 -10 q 26 0 50 10 q 23 10 41 27 q 17 18 27 41 q 10 23 10 50 q 0 26 -10 49 q -10 24 -27 41 q -18 18 -41 28 q -24 10 -50 10 m -1383 -487 h 1844 v 1434 h -1844 m 1741 -1331 h -1638 v 746 l 461 -460 l 563 563 l 256 -256 l 358 358 m -1638 -60 v 337 h 1259 l -798 -798 m 942 798 h 235 v -132 l -358 -358 l -184 183 z"
            />
            <path type="path" class="OfficeIconColors_m20" d="M 1894 1690 h -1740 v -1332 h 1740 z" />
            <path
              type="path"
              class="OfficeIconColors_m26"
              d="M 152 1278 l 514 -504 l 569 549 l 250 -246 l 413 401 v 211 h -1746 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m25"
              d="M 1858 1521 l -373 -373 l -184 183 l 322 322 l -72 73 l -885 -886 l -476 476 l -73 -72 l 549 -548 l 563 563 l 256 -256 l 446 446 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m2226"
              d="M 1485 794 q -27 0 -50 -10 q -23 -10 -40 -28 q -18 -17 -28 -41 q -10 -23 -10 -49 q 0 -27 10 -50 q 10 -23 28 -41 q 17 -17 40 -27 q 23 -10 50 -10 q 26 0 50 10 q 23 10 41 27 q 17 18 27 41 q 10 23 10 50 q 0 26 -10 49 q -10 24 -27 41 q -18 18 -41 28 q -24 10 -50 10 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m2227"
              d="M 1459 653 q 0 44 17 83 q 16 39 45 68 q 29 30 68 47 q 38 18 82 19 q -27 24 -61 38 q -35 14 -74 14 q -42 0 -79 -16 q -38 -16 -66 -44 q -28 -28 -44 -66 q -16 -37 -16 -79 q 0 -39 14 -74 q 14 -34 38 -61 q 24 -27 57 -45 q 32 -17 70 -22 q -23 28 -37 63 q -14 35 -14 75 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 102 307 h 1844 v 1434 h -1844 m 1741 -103 v -1228 h -1638 v 1228 z"
            />
          </svg>
        </FluentIcon>
      </IconButton>
    </Tooltip>
  {/if}

  <MenuFlyout alignment="start" placement="bottom" offset={0} bind:open={widgetsMenuOpen}>
    <svelte:fragment slot="flyout">
      <MenuFlyoutItem disabled={sweepWidgetDisabled}>SweepWidget giveaway</MenuFlyoutItem>
      <MenuFlyoutItem
        disabled={ytDisabled}
        on:click={() => (insertYoutubeWidgetDialogOpen = !insertYoutubeWidgetDialogOpen)}
      >
        YouTube video
      </MenuFlyoutItem>
    </svelte:fragment>
  </MenuFlyout>
  <YoutubeVideoIdDialog
    bind:open={insertYoutubeWidgetDialogOpen}
    {editor}
    handleSumbit={async (videoId) => {
      if (ytDisabled) return;
      editor?.chain().focus().insertYoutubeWidget(videoId).run();
    }}
  />
  <Button on:click={() => (widgetsMenuOpen = !widgetsMenuOpen)} disabled={widgetsDisabled}>
    <FluentIcon name="Apps20Regular" mode="ribbonButtonIconLeft" />
    Widgets
    <FluentIcon name="ChevronDown20Regular" mode="ribbonButtonIconRight" />
  </Button>

  <LinkDialog
    bind:open={insertLinkDialogOpen}
    {editor}
    handleSumbit={async (href) => {
      if (linkDisabled) return;
      if (href) {
        editor?.chain().focus().setLink({ href }).run();
      } else {
        editor?.chain().focus().unsetLink().run();
      }
    }}
  />
  {#if width > 400}
    <Button
      on:click={linkDisabled ? undefined : () => (insertLinkDialogOpen = !insertLinkDialogOpen)}
      disabled={linkDisabled}
      class={editor?.isActive('link') ? 'active' : ''}
    >
      <FluentIcon mode="ribbonButtonIconLeft">
        <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
          <path
            type="path"
            class="OfficeIconColors_HighContrast"
            d="M 1555 819 q 81 0 152 28 q 71 29 124 77 q 53 49 84 114 q 31 66 31 140 q 0 74 -31 139 q -31 65 -84 114 q -53 49 -124 77 q -71 28 -152 28 h -447 q -81 0 -152 -28 q -71 -28 -124 -77 q -54 -49 -84 -114 q -31 -65 -31 -139 q 0 -74 31 -140 q 30 -65 84 -114 q 53 -48 124 -77 q 71 -28 152 -28 h 18 v 103 h -18 q -58 0 -109 20 q -51 20 -89 54 q -38 35 -60 82 q -22 47 -22 100 q 0 53 22 99 q 22 47 60 82 q 38 35 89 55 q 51 20 109 20 h 447 q 58 0 109 -20 q 50 -20 88 -55 q 38 -35 60 -82 q 22 -46 22 -99 q 0 -53 -22 -100 q -22 -47 -60 -82 q -38 -34 -88 -54 q -51 -20 -109 -20 h -121 v -103 m -494 410 v -103 q 58 0 109 -20 q 51 -20 89 -55 q 38 -34 60 -81 q 22 -47 22 -100 q 0 -53 -22 -100 q -22 -46 -60 -81 q -38 -35 -89 -55 q -51 -20 -109 -20 h -447 q -58 0 -108 20 q -51 20 -89 55 q -38 35 -60 81 q -22 47 -22 100 q 0 53 22 100 q 22 47 60 81 q 38 35 89 55 q 50 20 108 20 h 121 v 103 h -121 q -81 0 -152 -28 q -71 -28 -124 -77 q -53 -49 -84 -115 q -31 -65 -31 -139 q 0 -74 31 -139 q 31 -65 84 -114 q 53 -49 124 -77 q 71 -28 152 -28 h 447 q 81 0 152 28 q 71 28 125 77 q 53 49 84 114 q 30 65 30 139 q 0 74 -30 139 q -31 66 -84 115 q -54 49 -125 77 q -71 28 -152 28 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m22"
            d="M 1555 819 q 81 0 152 28 q 71 29 124 77 q 53 49 84 114 q 31 66 31 140 q 0 74 -31 139 q -31 65 -84 114 q -53 49 -124 77 q -71 28 -152 28 h -447 q -81 0 -152 -28 q -71 -28 -124 -77 q -54 -49 -84 -114 q -31 -65 -31 -139 q 0 -74 31 -140 q 30 -65 84 -114 q 53 -48 124 -77 q 71 -28 152 -28 h 18 v 103 h -18 q -58 0 -109 20 q -51 20 -89 54 q -38 35 -60 82 q -22 47 -22 100 q 0 53 22 99 q 22 47 60 82 q 38 35 89 55 q 51 20 109 20 h 447 q 58 0 109 -20 q 50 -20 88 -55 q 38 -35 60 -82 q 22 -46 22 -99 q 0 -53 -22 -100 q -22 -47 -60 -82 q -38 -34 -88 -54 q -51 -20 -109 -20 h -121 v -103 m -494 410 v -103 q 58 0 109 -20 q 51 -20 89 -55 q 38 -34 60 -81 q 22 -47 22 -100 q 0 -53 -22 -100 q -22 -46 -60 -81 q -38 -35 -89 -55 q -51 -20 -109 -20 h -447 q -58 0 -108 20 q -51 20 -89 55 q -38 35 -60 81 q -22 47 -22 100 q 0 53 22 100 q 22 47 60 81 q 38 35 89 55 q 50 20 108 20 h 121 v 103 h -121 q -81 0 -152 -28 q -71 -28 -124 -77 q -53 -49 -84 -115 q -31 -65 -31 -139 q 0 -74 31 -139 q 31 -65 84 -114 q 53 -49 124 -77 q 71 -28 152 -28 h 447 q 81 0 152 28 q 71 28 125 77 q 53 49 84 114 q 30 65 30 139 q 0 74 -30 139 q -31 66 -84 115 q -54 49 -125 77 q -71 28 -152 28 z"
          />
        </svg>
      </FluentIcon>
      Link
    </Button>
  {:else}
    <Tooltip text="Insert link">
      <IconButton
        on:click={linkDisabled ? undefined : () => (insertLinkDialogOpen = !insertLinkDialogOpen)}
        disabled={linkDisabled}
        class={editor?.isActive('link') ? 'active' : ''}
      >
        <FluentIcon>
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 1555 819 q 81 0 152 28 q 71 29 124 77 q 53 49 84 114 q 31 66 31 140 q 0 74 -31 139 q -31 65 -84 114 q -53 49 -124 77 q -71 28 -152 28 h -447 q -81 0 -152 -28 q -71 -28 -124 -77 q -54 -49 -84 -114 q -31 -65 -31 -139 q 0 -74 31 -140 q 30 -65 84 -114 q 53 -48 124 -77 q 71 -28 152 -28 h 18 v 103 h -18 q -58 0 -109 20 q -51 20 -89 54 q -38 35 -60 82 q -22 47 -22 100 q 0 53 22 99 q 22 47 60 82 q 38 35 89 55 q 51 20 109 20 h 447 q 58 0 109 -20 q 50 -20 88 -55 q 38 -35 60 -82 q 22 -46 22 -99 q 0 -53 -22 -100 q -22 -47 -60 -82 q -38 -34 -88 -54 q -51 -20 -109 -20 h -121 v -103 m -494 410 v -103 q 58 0 109 -20 q 51 -20 89 -55 q 38 -34 60 -81 q 22 -47 22 -100 q 0 -53 -22 -100 q -22 -46 -60 -81 q -38 -35 -89 -55 q -51 -20 -109 -20 h -447 q -58 0 -108 20 q -51 20 -89 55 q -38 35 -60 81 q -22 47 -22 100 q 0 53 22 100 q 22 47 60 81 q 38 35 89 55 q 50 20 108 20 h 121 v 103 h -121 q -81 0 -152 -28 q -71 -28 -124 -77 q -53 -49 -84 -115 q -31 -65 -31 -139 q 0 -74 31 -139 q 31 -65 84 -114 q 53 -49 124 -77 q 71 -28 152 -28 h 447 q 81 0 152 28 q 71 28 125 77 q 53 49 84 114 q 30 65 30 139 q 0 74 -30 139 q -31 66 -84 115 q -54 49 -125 77 q -71 28 -152 28 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 1555 819 q 81 0 152 28 q 71 29 124 77 q 53 49 84 114 q 31 66 31 140 q 0 74 -31 139 q -31 65 -84 114 q -53 49 -124 77 q -71 28 -152 28 h -447 q -81 0 -152 -28 q -71 -28 -124 -77 q -54 -49 -84 -114 q -31 -65 -31 -139 q 0 -74 31 -140 q 30 -65 84 -114 q 53 -48 124 -77 q 71 -28 152 -28 h 18 v 103 h -18 q -58 0 -109 20 q -51 20 -89 54 q -38 35 -60 82 q -22 47 -22 100 q 0 53 22 99 q 22 47 60 82 q 38 35 89 55 q 51 20 109 20 h 447 q 58 0 109 -20 q 50 -20 88 -55 q 38 -35 60 -82 q 22 -46 22 -99 q 0 -53 -22 -100 q -22 -47 -60 -82 q -38 -34 -88 -54 q -51 -20 -109 -20 h -121 v -103 m -494 410 v -103 q 58 0 109 -20 q 51 -20 89 -55 q 38 -34 60 -81 q 22 -47 22 -100 q 0 -53 -22 -100 q -22 -46 -60 -81 q -38 -35 -89 -55 q -51 -20 -109 -20 h -447 q -58 0 -108 20 q -51 20 -89 55 q -38 35 -60 81 q -22 47 -22 100 q 0 53 22 100 q 22 47 60 81 q 38 35 89 55 q 50 20 108 20 h 121 v 103 h -121 q -81 0 -152 -28 q -71 -28 -124 -77 q -53 -49 -84 -115 q -31 -65 -31 -139 q 0 -74 31 -139 q 31 -65 84 -114 q 53 -49 124 -77 q 71 -28 152 -28 h 447 q 81 0 152 28 q 71 28 125 77 q 53 49 84 114 q 30 65 30 139 q 0 74 -30 139 q -31 66 -84 115 q -54 49 -125 77 q -71 28 -152 28 z"
            />
          </svg>
        </FluentIcon>
      </IconButton>
    </Tooltip>
  {/if}

  {#if width > 640}
    <Button
      on:click={pullQuoteDisabled ? undefined : () => editor?.chain().focus().insertPullQuote().run()}
      disabled={pullQuoteDisabled}
      class={editor?.isActive('pullQuote') ? 'active' : ''}
    >
      <FluentIcon name="TextQuote20Regular" mode="ribbonButtonIconLeft" />
      Pull quote
    </Button>
  {:else}
    <Tooltip text="Insert pull quote">
      <IconButton
        on:click={pullQuoteDisabled ? undefined : () => editor?.chain().focus().insertPullQuote().run()}
        disabled={pullQuoteDisabled}
        class={editor?.isActive('pullQuote') ? 'active' : ''}
      >
        <FluentIcon name="TextQuote20Regular" />
      </IconButton>
    </Tooltip>
  {/if}

  {#if width > 640}
    <Button
      on:click={tablesDisabled ? undefined : () => editor?.chain().focus().insertTable().run()}
      disabled={tablesDisabled}
    >
      <FluentIcon mode="ribbonButtonIconLeft">
        <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
          <path
            type="path"
            class="OfficeIconColors_HighContrast"
            d="M 102 102 h 1844 v 1844 h -1844 m 103 -1741 v 205 h 1638 v -205 m -1024 1126 h 410 v -307 h -410 m 410 410 h -410 v 409 h 410 m -512 -512 v -307 h -512 v 307 m 1024 -819 h -410 v 410 h 410 m 102 102 v 307 h 512 v -307 m -512 -102 h 512 v -410 h -512 m -614 0 h -512 v 410 h 512 m -512 512 v 409 h 512 v -409 m 614 409 h 512 v -409 h -512 z"
          />
          <path type="path" class="OfficeIconColors_m20" d="M 1894 1894 h -1740 v -1433 h 1740 z" />
          <path type="path" class="OfficeIconColors_m21" d="M 1894 461 h -1740 v -307 h 1740 z" />
          <path
            type="path"
            class="OfficeIconColors_m23"
            d="M 1894 1024 h -563 v 307 h 563 v 103 h -563 v 460 h -102 v -460 h -410 v 460 h -102 v -460 h -563 v -103 h 563 v -307 h -563 v -102 h 563 v -461 h 102 v 461 h 410 v -461 h 102 v 461 h 563 m -665 409 v -307 h -410 v 307 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m22"
            d="M 102 102 h 1844 v 1844 h -1844 m 1741 -103 v -1331 h -1638 v 1331 m 1638 -1433 v -205 h -1638 v 205 z"
          />
        </svg>
      </FluentIcon>
      Table
    </Button>
  {:else}
    <Tooltip text="Insert table">
      <IconButton
        on:click={tablesDisabled ? undefined : () => editor?.chain().focus().insertTable().run()}
        disabled={tablesDisabled}
      >
        <FluentIcon>
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 102 102 h 1844 v 1844 h -1844 m 103 -1741 v 205 h 1638 v -205 m -1024 1126 h 410 v -307 h -410 m 410 410 h -410 v 409 h 410 m -512 -512 v -307 h -512 v 307 m 1024 -819 h -410 v 410 h 410 m 102 102 v 307 h 512 v -307 m -512 -102 h 512 v -410 h -512 m -614 0 h -512 v 410 h 512 m -512 512 v 409 h 512 v -409 m 614 409 h 512 v -409 h -512 z"
            />
            <path type="path" class="OfficeIconColors_m20" d="M 1894 1894 h -1740 v -1433 h 1740 z" />
            <path type="path" class="OfficeIconColors_m21" d="M 1894 461 h -1740 v -307 h 1740 z" />
            <path
              type="path"
              class="OfficeIconColors_m23"
              d="M 1894 1024 h -563 v 307 h 563 v 103 h -563 v 460 h -102 v -460 h -410 v 460 h -102 v -460 h -563 v -103 h 563 v -307 h -563 v -102 h 563 v -461 h 102 v 461 h 410 v -461 h 102 v 461 h 563 m -665 409 v -307 h -410 v 307 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 102 102 h 1844 v 1844 h -1844 m 1741 -103 v -1331 h -1638 v 1331 m 1638 -1433 v -205 h -1638 v 205 z"
            />
          </svg>
        </FluentIcon>
      </IconButton>
    </Tooltip>
  {/if}

  {#if width > 750}
    <Button
      on:click={() => {
        if (setCommentDisabled) return;
        editor?.chain().focus().setComment(coreNewCommentAttrs).blur().run();
        $richTextParams.set('comments', 1);
      }}
      disabled={setCommentDisabled}
    >
      <FluentIcon mode="ribbonButtonIconLeft">
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
      Insert comment
    </Button>
  {:else}
    <Tooltip text="Add comment">
      <IconButton
        on:click={() => {
          if (setCommentDisabled) return;
          editor?.chain().focus().setComment(coreNewCommentAttrs).blur().run();
          $richTextParams.set('comments', 1);
        }}
        disabled={setCommentDisabled}
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
    </Tooltip>
  {/if}

  <Tooltip text="Delete comment" alignment="end">
    <IconButton
      on:click={unsetCommentDisabled ? undefined : () => editor?.chain().focus().unsetComment().run()}
      disabled={unsetCommentDisabled}
    >
      <FluentIcon>
        <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
          <path
            type="path"
            class="OfficeIconColors_HighContrast"
            d="M 578 512 l 446 446 l -66 66 l -446 -446 l -446 446 l -66 -66 l 446 -446 l -446 -446 l 66 -66 l 446 446 l 446 -446 l 66 66 m 922 139 v 1229 h -1022 l -514 512 v -512 h -308 v -229 l 103 -103 v 229 h 307 v 367 l 367 -367 h 964 v -1024 h -843 l 102 -102 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m20"
            d="M 1894 256 v 1126 h -991 l -442 440 v -440 h -307 v -229 l 358 -358 l 446 446 l 283 -283 l -446 -446 l 256 -256 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m22"
            d="M 1946 205 v 1229 h -1022 l -514 512 v -512 h -308 v -229 l 103 -103 v 229 h 307 v 367 l 367 -367 h 964 v -1024 h -843 l 102 -102 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m213"
            d="M 578 512 l 446 446 l -66 66 l -446 -446 l -446 446 l -66 -66 l 446 -446 l -446 -446 l 66 -66 l 446 446 l 446 -446 l 66 66 z"
          />
        </svg>
      </FluentIcon>
    </IconButton>
  </Tooltip>
</div>
