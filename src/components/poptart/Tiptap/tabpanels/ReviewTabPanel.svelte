<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import type { Editor } from '@tiptap/core';
  import { Button, IconButton, Tooltip } from 'fluent-svelte';
  import type { ComponentProps } from 'svelte';
  import type { tiptapOptions } from '../../../../config';
  import type Tiptap from '../Tiptap.svelte';
  import { richTextParams } from '../richTextParams';

  export let editor: Editor | null;
  export let visible = false;
  export let disabled = false;
  export let options: tiptapOptions | undefined = undefined;
  export let user: ComponentProps<Tiptap>['user'] | null = null;
  export let trackChanges: boolean | undefined;
  export let toggleTrackChanges: (bool: boolean) => void;
  export let docStatsDialogOpen = false;

  $: coreNewCommentAttrs = {
    color: user?.color || '',
    commenter: { name: user?.name || '', photo: user?.photo || '' },
    sessionId: user?.sessionId || '',
  };

  let width = 1000;

  $: previewMode = $richTextParams.obj.previewMode > 0;
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
  <Tooltip text="Learn about Microsoft Editor">
    {#if width > 820}
      <Button disabled={disabled || previewMode || true}>
        <FluentIcon mode="ribbonButtonIconLeft">
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 1792 512 q 32 0 60 12 q 28 12 49 33 q 21 21 33 49 q 12 28 12 60 q 0 32 -12 59 q -12 28 -33 49 q -21 21 -49 33 q -28 12 -60 12 h -598 l -148 205 h 439 q 32 0 60 12 q 28 12 49 33 q 20 21 32 49 q 12 28 12 60 q 0 32 -12 59 q -12 28 -32 49 q -21 21 -49 33 q -28 12 -60 12 h -663 l -148 205 h 504 q 31 0 59 12 q 28 12 49 33 q 21 21 33 49 q 12 28 12 60 q 0 32 -12 59 q -12 28 -33 49 q -21 21 -49 33 q -28 12 -59 12 h -812 l -103 74 q -8 5 -17 5 q -9 0 -16 -4 l -115 85 q -3 2 -10 2 q -26 0 -44 -15 q -18 -15 -18 -33 v -3 l 42 -139 q -13 -10 -13 -25 q 0 -3 2 -9 l 97 -324 l 1022 -1402 q 10 -7 15 -9 q 4 -2 14 -2 q 8 0 30 10 q 22 10 53 27 q 30 17 66 40 q 35 23 70 49 q 34 26 64 53 q 30 28 49 55 q 5 7 8 13 q 3 6 3 11 q 0 6 -5 13 l -143 197 m -1153 992 l -77 257 l 59 42 l 222 -158 l 907 -1249 l -200 -142 v 1 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 97 1951 l 47 -156 l -17 -13 l 90 -302 l 1011 -1385 q 8 3 27 13 q 19 11 45 27 q 25 16 55 36 q 29 20 57 41 q 28 22 53 45 q 25 23 42 44 l -1003 1381 l -262 187 l -25 -15 l -18 23 l -101 75 q -1 0 -1 -1 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m2262"
              d="M 1792 512 q 32 0 60 12 q 28 12 49 33 q 21 21 33 49 q 12 28 12 60 q 0 32 -12 59 q -12 28 -33 49 q -21 21 -49 33 q -28 12 -60 12 h -598 l -148 205 h 439 q 32 0 60 12 q 28 12 49 33 q 20 21 32 49 q 12 28 12 60 q 0 32 -12 59 q -12 28 -32 49 q -21 21 -49 33 q -28 12 -60 12 h -663 l -148 205 h 504 q 31 0 59 12 q 28 12 49 33 q 21 21 33 49 q 12 28 12 60 q 0 32 -12 59 q -12 28 -33 49 q -21 21 -49 33 q -28 12 -59 12 h -812 l -103 74 q -8 5 -17 5 q -9 0 -16 -4 l -115 85 q -3 2 -10 2 q -26 0 -44 -15 q -18 -15 -18 -33 v -3 l 42 -139 q -13 -10 -13 -25 q 0 -3 2 -9 l 97 -324 l 1022 -1402 q 10 -7 15 -9 q 4 -2 14 -2 q 8 0 30 10 q 22 10 53 27 q 30 17 66 40 q 35 23 70 49 q 34 26 64 53 q 30 28 49 55 q 5 7 8 13 q 3 6 3 11 q 0 6 -5 13 l -143 197 m -1153 992 l -77 257 l 59 42 l 222 -158 l 907 -1249 l -200 -142 v 1 z"
            />
          </svg>
        </FluentIcon>
        Editor (spell check)
      </Button>
    {:else}
      <IconButton disabled={disabled || true}>
        <FluentIcon>
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 1792 512 q 32 0 60 12 q 28 12 49 33 q 21 21 33 49 q 12 28 12 60 q 0 32 -12 59 q -12 28 -33 49 q -21 21 -49 33 q -28 12 -60 12 h -598 l -148 205 h 439 q 32 0 60 12 q 28 12 49 33 q 20 21 32 49 q 12 28 12 60 q 0 32 -12 59 q -12 28 -32 49 q -21 21 -49 33 q -28 12 -60 12 h -663 l -148 205 h 504 q 31 0 59 12 q 28 12 49 33 q 21 21 33 49 q 12 28 12 60 q 0 32 -12 59 q -12 28 -33 49 q -21 21 -49 33 q -28 12 -59 12 h -812 l -103 74 q -8 5 -17 5 q -9 0 -16 -4 l -115 85 q -3 2 -10 2 q -26 0 -44 -15 q -18 -15 -18 -33 v -3 l 42 -139 q -13 -10 -13 -25 q 0 -3 2 -9 l 97 -324 l 1022 -1402 q 10 -7 15 -9 q 4 -2 14 -2 q 8 0 30 10 q 22 10 53 27 q 30 17 66 40 q 35 23 70 49 q 34 26 64 53 q 30 28 49 55 q 5 7 8 13 q 3 6 3 11 q 0 6 -5 13 l -143 197 m -1153 992 l -77 257 l 59 42 l 222 -158 l 907 -1249 l -200 -142 v 1 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 97 1951 l 47 -156 l -17 -13 l 90 -302 l 1011 -1385 q 8 3 27 13 q 19 11 45 27 q 25 16 55 36 q 29 20 57 41 q 28 22 53 45 q 25 23 42 44 l -1003 1381 l -262 187 l -25 -15 l -18 23 l -101 75 q -1 0 -1 -1 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m2262"
              d="M 1792 512 q 32 0 60 12 q 28 12 49 33 q 21 21 33 49 q 12 28 12 60 q 0 32 -12 59 q -12 28 -33 49 q -21 21 -49 33 q -28 12 -60 12 h -598 l -148 205 h 439 q 32 0 60 12 q 28 12 49 33 q 20 21 32 49 q 12 28 12 60 q 0 32 -12 59 q -12 28 -32 49 q -21 21 -49 33 q -28 12 -60 12 h -663 l -148 205 h 504 q 31 0 59 12 q 28 12 49 33 q 21 21 33 49 q 12 28 12 60 q 0 32 -12 59 q -12 28 -33 49 q -21 21 -49 33 q -28 12 -59 12 h -812 l -103 74 q -8 5 -17 5 q -9 0 -16 -4 l -115 85 q -3 2 -10 2 q -26 0 -44 -15 q -18 -15 -18 -33 v -3 l 42 -139 q -13 -10 -13 -25 q 0 -3 2 -9 l 97 -324 l 1022 -1402 q 10 -7 15 -9 q 4 -2 14 -2 q 8 0 30 10 q 22 10 53 27 q 30 17 66 40 q 35 23 70 49 q 34 26 64 53 q 30 28 49 55 q 5 7 8 13 q 3 6 3 11 q 0 6 -5 13 l -143 197 m -1153 992 l -77 257 l 59 42 l 222 -158 l 907 -1249 l -200 -142 v 1 z"
            />
          </svg>
        </FluentIcon>
      </IconButton>
    {/if}
  </Tooltip>

  <Tooltip text="View document field word count">
    <IconButton {disabled} on:click={() => (docStatsDialogOpen = !docStatsDialogOpen)}>
      <FluentIcon>
        <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
          <path
            type="path"
            class="OfficeIconColors_HighContrast"
            d="M 1946 102 v 103 h -1844 v -103 m 1434 512 h -1434 v -102 h 1434 m -1434 410 h 1844 v 102 h -1844 m 0 307 h 410 v 103 h -410 m 0 307 h 410 v 102 h -410 m 677 -541 q 47 -25 95 -59 h 48 v 703 h -103 v -572 q -29 21 -69 39 q -41 19 -85 30 v -95 q 32 -11 61 -23 q 28 -11 53 -23 m 356 547 h 304 v 96 h -426 v -53 q 0 -31 8 -63 q 8 -31 27 -61 q 18 -29 49 -61 q 31 -31 78 -69 q 40 -31 68 -56 q 28 -25 46 -48 q 18 -22 26 -45 q 8 -23 8 -51 q 0 -52 -31 -81 q -31 -29 -82 -29 q -89 0 -171 79 v -107 q 45 -33 89 -48 q 43 -15 102 -15 q 98 0 152 50 q 54 50 54 139 q 0 27 -5 50 q -5 24 -13 46 q -9 23 -20 42 q -12 19 -32 40 q -21 22 -52 48 q -31 27 -79 64 q -55 43 -77 71 q -23 29 -23 60 m 649 -276 q 76 9 119 53 q 43 44 43 110 q 0 47 -18 85 q -18 39 -51 66 q -33 28 -80 43 q -48 15 -107 15 q -23 0 -47 -3 q -25 -3 -47 -9 q -23 -5 -41 -12 q -19 -6 -30 -13 v -110 q 15 12 34 22 q 19 11 41 18 q 22 8 45 12 q 23 4 44 4 q 66 0 104 -32 q 38 -31 38 -83 q 0 -57 -44 -86 q -45 -29 -131 -29 h -60 v -93 h 58 q 72 0 113 -27 q 40 -27 40 -81 q 0 -48 -31 -75 q -31 -27 -88 -27 q -73 0 -137 50 v -102 q 31 -17 75 -28 q 43 -10 91 -10 q 47 0 85 13 q 38 13 65 35 q 26 23 40 54 q 14 31 14 67 q 0 67 -36 110 q -36 43 -101 61 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m22"
            d="M 1946 205 h -1844 v -103 h 1844 m -410 512 h -1434 v -102 h 1434 m 410 512 h -1844 v -102 h 1844 m -1434 512 h -410 v -103 h 410 m 0 512 h -410 v -102 h 410 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m24"
            d="M 779 1302 q 47 -25 95 -59 h 48 v 703 h -103 v -572 q -29 21 -69 39 q -41 19 -85 30 v -95 q 32 -11 61 -23 q 28 -11 53 -23 m 356 547 h 304 v 96 h -426 v -53 q 0 -31 8 -63 q 8 -31 27 -61 q 18 -29 49 -61 q 31 -31 78 -69 q 40 -31 68 -56 q 28 -25 46 -48 q 18 -22 26 -45 q 8 -23 8 -51 q 0 -52 -31 -81 q -31 -29 -82 -29 q -89 0 -171 79 v -107 q 45 -33 89 -48 q 43 -15 102 -15 q 98 0 152 50 q 54 50 54 139 q 0 27 -5 50 q -5 24 -13 46 q -9 23 -20 42 q -12 19 -32 40 q -21 22 -52 48 q -31 27 -79 64 q -55 43 -77 71 q -23 29 -23 60 m 649 -276 q 76 9 119 53 q 43 44 43 110 q 0 47 -18 85 q -18 39 -51 66 q -33 28 -80 43 q -48 15 -107 15 q -23 0 -47 -3 q -25 -3 -47 -9 q -23 -5 -41 -12 q -19 -6 -30 -13 v -110 q 15 12 34 22 q 19 11 41 18 q 22 8 45 12 q 23 4 44 4 q 66 0 104 -32 q 38 -31 38 -83 q 0 -57 -44 -86 q -45 -29 -131 -29 h -60 v -93 h 58 q 72 0 113 -27 q 40 -27 40 -81 q 0 -48 -31 -75 q -31 -27 -88 -27 q -73 0 -137 50 v -102 q 31 -17 75 -28 q 43 -10 91 -10 q 47 0 85 13 q 38 13 65 35 q 26 23 40 54 q 14 31 14 67 q 0 67 -36 110 q -36 43 -101 61 z"
          />
        </svg>
      </FluentIcon>
    </IconButton>
  </Tooltip>

  <span class="bar" />

  <Tooltip text="Enable track changes for all editors">
    {#if width > 520}
      <Button
        disabled={disabled || previewMode || !options?.features.trackChanges || !toggleTrackChanges}
        on:click={() => {
          toggleTrackChanges(!trackChanges);
        }}
        class={!!trackChanges ? 'active' : ''}
      >
        <FluentIcon mode="ribbonButtonIconLeft">
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 921 717 h -307 v -103 h 307 m 284 410 h -386 v -102 h 409 v 79 m -330 330 h -284 v -102 h 386 m -454 717 h -239 v -1844 h 920 l 456 456 q -15 10 -29 20 q -14 11 -27 24 l -115 115 h -387 v -512 h -716 v 1638 h 177 m 642 -1229 h 366 l -366 -366 m 511 1108 v 590 h -594 l 103 -103 h 389 v -386 m 351 -783 q 30 30 45 68 q 15 38 15 77 q 0 40 -15 77 q -15 38 -45 68 l -916 910 l -454 167 l 183 -468 l 898 -899 q 29 -29 67 -44 q 38 -15 77 -15 q 40 0 78 15 q 37 15 67 44 m -1064 921 q 90 53 145 144 l 759 -759 l -145 -145 m -889 1032 l 190 -69 q -43 -76 -119 -119 m 1051 -787 q 15 -15 23 -34 q 7 -18 7 -38 q 0 -21 -8 -40 q -8 -18 -22 -33 q -15 -14 -33 -22 q -19 -8 -40 -8 q -20 0 -38 7 q -19 8 -34 23 l -16 16 l 145 144 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 569 1886 h -211 v -1732 h 840 l 443 436 q -3 3 -7 5 q -4 3 -7 7 l -913 914 m 974 -110 v 480 h -483 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m213"
              d="M 921 717 h -307 v -103 h 307 m 284 410 h -386 v -102 h 409 v 79 m -330 330 h -284 v -102 h 386 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 546 1946 h -239 v -1844 h 920 l 456 456 q -15 10 -29 20 q -14 11 -27 24 l -115 115 h -387 v -512 h -716 v 1638 h 177 m 642 -1229 h 366 l -366 -366 m 511 1108 v 590 h -594 l 103 -103 h 389 v -386 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 820 1634 q 240 -270 448 -482 q 59 -60 119 -120 q 60 -59 118 -113 q 57 -53 111 -99 q 53 -46 99 -80 q 45 -33 82 -52 q 36 -19 60 -19 q 8 0 12 1 q 41 11 68 28 q 26 17 41 37 q 15 20 21 41 q 6 22 6 42 q 0 17 -3 32 q -3 16 -7 27 q -4 13 -9 25 l -957 950 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m26"
              d="M 837 1609 q 77 27 134 84 q 56 57 83 133 l -362 145 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m24"
              d="M 1988 674 q 30 30 45 68 q 15 38 15 77 q 0 40 -15 77 q -15 38 -45 68 l -916 910 l -454 167 l 183 -468 l 898 -899 q 29 -29 67 -44 q 38 -15 77 -15 q 40 0 78 15 q 37 15 67 44 m -1064 921 q 90 53 145 144 l 759 -759 l -145 -145 m -889 1032 l 190 -69 q -43 -76 -119 -119 m 1051 -787 q 15 -15 23 -34 q 7 -18 7 -38 q 0 -21 -8 -40 q -8 -18 -22 -33 q -15 -14 -33 -22 q -19 -8 -40 -8 q -20 0 -38 7 q -19 8 -34 23 l -16 16 l 145 144 z"
            />
          </svg>
        </FluentIcon>
        Track changes (text only)
      </Button>
    {:else}
      <IconButton
        disabled={disabled || previewMode || !options?.features.trackChanges || !toggleTrackChanges}
        on:click={() => {
          toggleTrackChanges(!trackChanges);
        }}
        class={!!trackChanges ? 'active' : ''}
      >
        <FluentIcon>
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 921 717 h -307 v -103 h 307 m 284 410 h -386 v -102 h 409 v 79 m -330 330 h -284 v -102 h 386 m -454 717 h -239 v -1844 h 920 l 456 456 q -15 10 -29 20 q -14 11 -27 24 l -115 115 h -387 v -512 h -716 v 1638 h 177 m 642 -1229 h 366 l -366 -366 m 511 1108 v 590 h -594 l 103 -103 h 389 v -386 m 351 -783 q 30 30 45 68 q 15 38 15 77 q 0 40 -15 77 q -15 38 -45 68 l -916 910 l -454 167 l 183 -468 l 898 -899 q 29 -29 67 -44 q 38 -15 77 -15 q 40 0 78 15 q 37 15 67 44 m -1064 921 q 90 53 145 144 l 759 -759 l -145 -145 m -889 1032 l 190 -69 q -43 -76 -119 -119 m 1051 -787 q 15 -15 23 -34 q 7 -18 7 -38 q 0 -21 -8 -40 q -8 -18 -22 -33 q -15 -14 -33 -22 q -19 -8 -40 -8 q -20 0 -38 7 q -19 8 -34 23 l -16 16 l 145 144 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 569 1886 h -211 v -1732 h 840 l 443 436 q -3 3 -7 5 q -4 3 -7 7 l -913 914 m 974 -110 v 480 h -483 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m213"
              d="M 921 717 h -307 v -103 h 307 m 284 410 h -386 v -102 h 409 v 79 m -330 330 h -284 v -102 h 386 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 546 1946 h -239 v -1844 h 920 l 456 456 q -15 10 -29 20 q -14 11 -27 24 l -115 115 h -387 v -512 h -716 v 1638 h 177 m 642 -1229 h 366 l -366 -366 m 511 1108 v 590 h -594 l 103 -103 h 389 v -386 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 820 1634 q 240 -270 448 -482 q 59 -60 119 -120 q 60 -59 118 -113 q 57 -53 111 -99 q 53 -46 99 -80 q 45 -33 82 -52 q 36 -19 60 -19 q 8 0 12 1 q 41 11 68 28 q 26 17 41 37 q 15 20 21 41 q 6 22 6 42 q 0 17 -3 32 q -3 16 -7 27 q -4 13 -9 25 l -957 950 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m26"
              d="M 837 1609 q 77 27 134 84 q 56 57 83 133 l -362 145 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m24"
              d="M 1988 674 q 30 30 45 68 q 15 38 15 77 q 0 40 -15 77 q -15 38 -45 68 l -916 910 l -454 167 l 183 -468 l 898 -899 q 29 -29 67 -44 q 38 -15 77 -15 q 40 0 78 15 q 37 15 67 44 m -1064 921 q 90 53 145 144 l 759 -759 l -145 -145 m -889 1032 l 190 -69 q -43 -76 -119 -119 m 1051 -787 q 15 -15 23 -34 q 7 -18 7 -38 q 0 -21 -8 -40 q -8 -18 -22 -33 q -15 -14 -33 -22 q -19 -8 -40 -8 q -20 0 -38 7 q -19 8 -34 23 l -16 16 l 145 144 z"
            />
          </svg>
        </FluentIcon>
      </IconButton>
    {/if}
  </Tooltip>

  <Tooltip text="Accept change">
    {#if width > 560}
      <Button
        disabled={disabled || previewMode || !options?.features.trackChanges || !editor?.can().approveChange()}
        on:click={() => editor?.chain().focus().approveChange().nextChange().run()}
      >
        <FluentIcon mode="ribbonButtonIconLeft">
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 614 1506 l 73 -72 l 439 439 l 850 -849 l 72 72 l -922 922 m -307 -1096 h 410 v 102 h -410 m 103 -307 h -308 v -103 h 308 m -223 615 h 427 v 102 h -324 m 35 615 h -530 v -1844 h 921 l 513 512 v 428 l -103 102 v -427 h -512 v -512 h -716 v 1638 h 324 m 495 -1229 h 367 l -367 -366 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 777 1886 h -419 v -1732 h 841 l 491 482 v 457 l -564 563 l -439 -440 l -290 290 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m213"
              d="M 819 922 h 410 v 102 h -410 m 103 -307 h -308 v -103 h 308 m -223 615 h 427 v 102 h -324 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 837 1946 h -530 v -1844 h 921 l 513 512 v 428 l -103 102 v -427 h -512 v -512 h -716 v 1638 h 324 m 495 -1229 h 367 l -367 -366 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m27"
              d="M 1126 2018 l -512 -512 l 73 -72 l 439 439 l 850 -849 l 72 72 z"
            />
          </svg>
        </FluentIcon>
        Accept
      </Button>
    {:else}
      <IconButton
        disabled={disabled || previewMode || !options?.features.trackChanges || !editor?.can().approveChange()}
        on:click={() => editor?.chain().focus().approveChange().nextChange().run()}
      >
        <FluentIcon>
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 614 1506 l 73 -72 l 439 439 l 850 -849 l 72 72 l -922 922 m -307 -1096 h 410 v 102 h -410 m 103 -307 h -308 v -103 h 308 m -223 615 h 427 v 102 h -324 m 35 615 h -530 v -1844 h 921 l 513 512 v 428 l -103 102 v -427 h -512 v -512 h -716 v 1638 h 324 m 495 -1229 h 367 l -367 -366 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 777 1886 h -419 v -1732 h 841 l 491 482 v 457 l -564 563 l -439 -440 l -290 290 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m213"
              d="M 819 922 h 410 v 102 h -410 m 103 -307 h -308 v -103 h 308 m -223 615 h 427 v 102 h -324 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 837 1946 h -530 v -1844 h 921 l 513 512 v 428 l -103 102 v -427 h -512 v -512 h -716 v 1638 h 324 m 495 -1229 h 367 l -367 -366 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m27"
              d="M 1126 2018 l -512 -512 l 73 -72 l 439 439 l 850 -849 l 72 72 z"
            />
          </svg>
        </FluentIcon>
      </IconButton>
    {/if}
  </Tooltip>

  <Tooltip text="Reject change">
    {#if width > 620}
      <Button
        disabled={disabled || previewMode || !options?.features.trackChanges || !editor?.can().rejectChange()}
        on:click={() => editor?.chain().focus().rejectChange().nextChange().run()}
      >
        <FluentIcon mode="ribbonButtonIconLeft">
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 1602 1536 l 446 446 l -66 66 l -446 -446 l -446 446 l -66 -66 l 446 -446 l -446 -446 l 66 -66 l 446 446 l 446 -446 l 66 66 m -1205 856 h -536 v -1844 h 921 l 513 512 v 434 l -103 103 v -434 h -512 v -512 h -716 v 1638 h 536 m 283 -1229 h 367 l -367 -366 m -356 776 h -54 v -102 h 156 m -53 -205 h -308 v -103 h 308 m 126 717 h -434 v -102 h 332 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 903 1886 h -545 v -1732 h 841 l 491 482 v 463 l -154 154 l -446 -446 l -283 283 l 446 446 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m213"
              d="M 873 1024 h -54 v -102 h 156 m -53 -205 h -308 v -103 h 308 m 126 717 h -434 v -102 h 332 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 843 1946 h -536 v -1844 h 921 l 513 512 v 434 l -103 103 v -434 h -512 v -512 h -716 v 1638 h 536 m 283 -1229 h 367 l -367 -366 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m213"
              d="M 1602 1536 l 446 446 l -66 66 l -446 -446 l -446 446 l -66 -66 l 446 -446 l -446 -446 l 66 -66 l 446 446 l 446 -446 l 66 66 z"
            />
          </svg>
        </FluentIcon>
        Reject
      </Button>
    {:else}
      <IconButton
        disabled={disabled || previewMode || !options?.features.trackChanges || !editor?.can().rejectChange()}
        on:click={() => editor?.chain().focus().rejectChange().nextChange().run()}
      >
        <FluentIcon>
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 1602 1536 l 446 446 l -66 66 l -446 -446 l -446 446 l -66 -66 l 446 -446 l -446 -446 l 66 -66 l 446 446 l 446 -446 l 66 66 m -1205 856 h -536 v -1844 h 921 l 513 512 v 434 l -103 103 v -434 h -512 v -512 h -716 v 1638 h 536 m 283 -1229 h 367 l -367 -366 m -356 776 h -54 v -102 h 156 m -53 -205 h -308 v -103 h 308 m 126 717 h -434 v -102 h 332 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 903 1886 h -545 v -1732 h 841 l 491 482 v 463 l -154 154 l -446 -446 l -283 283 l 446 446 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m213"
              d="M 873 1024 h -54 v -102 h 156 m -53 -205 h -308 v -103 h 308 m 126 717 h -434 v -102 h 332 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 843 1946 h -536 v -1844 h 921 l 513 512 v 434 l -103 103 v -434 h -512 v -512 h -716 v 1638 h 536 m 283 -1229 h 367 l -367 -366 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m213"
              d="M 1602 1536 l 446 446 l -66 66 l -446 -446 l -446 446 l -66 -66 l 446 -446 l -446 -446 l 66 -66 l 446 446 l 446 -446 l 66 66 z"
            />
          </svg>
        </FluentIcon>
      </IconButton>
    {/if}
  </Tooltip>

  <Tooltip text="Go to previous change">
    <IconButton
      disabled={disabled || previewMode || !editor?.can().previousChange()}
      on:click={() => editor?.chain().focus().previousChange().run()}
    >
      <FluentIcon>
        <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
          <path
            type="path"
            class="OfficeIconColors_HighContrast"
            d="M 1126 717 v -512 h -716 v 1638 h 653 l 102 103 h -858 v -1844 h 921 l 513 512 v 551 l -103 -103 v -345 m -409 -103 h 367 l -367 -366 m -307 469 h -308 v -103 h 308 m 307 410 h -410 v -102 h 410 m -205 409 h -410 v -102 h 410 m 1024 409 h -828 l 337 338 l -72 72 l -461 -461 l 461 -461 l 72 73 l -337 337 h 828 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m20"
            d="M 807 1587 l 307 307 h -756 v -1740 h 841 l 491 482 v 478 l -205 -205 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m213"
            d="M 922 717 h -308 v -103 h 308 m 307 410 h -410 v -102 h 410 m -103 409 h -512 v -102 h 512 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m22"
            d="M 1126 717 v -512 h -716 v 1638 h 653 l 102 103 h -858 v -1844 h 921 l 513 512 v 551 l -103 -103 v -345 m -409 -103 h 367 l -367 -366 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m24"
            d="M 2048 1638 h -828 l 337 338 l -72 72 l -461 -461 l 461 -461 l 72 73 l -337 337 h 828 z"
          />
        </svg>
      </FluentIcon>
    </IconButton>
  </Tooltip>

  <Tooltip text="Go to next change">
    <IconButton
      disabled={disabled || previewMode || !editor?.can().nextChange()}
      on:click={() => editor?.chain().focus().nextChange().run()}
    >
      <FluentIcon>
        <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
          <path
            type="path"
            class="OfficeIconColors_HighContrast"
            d="M 1328 1946 h -1021 v -1844 h 921 l 513 512 v 449 l -103 -103 v -243 h -512 v -512 h -716 v 1638 h 1020 m -201 -1229 h 367 l -367 -366 m -205 1288 h 828 l -337 -337 l 72 -73 l 461 461 l -461 461 l -72 -72 l 337 -338 h -828 m -205 -716 h 410 v 102 h -410 m 103 -307 h -308 v -103 h 308 m 204 717 h -512 v -102 h 512 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m20"
            d="M 1387 1886 h -1029 v -1732 h 841 l 491 482 v 376 l -103 -103 l -289 290 l 234 235 h -610 v 307 h 610 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m213"
            d="M 922 717 h -308 v -103 h 308 m 307 410 h -410 v -102 h 410 m -103 409 h -512 v -102 h 512 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m22"
            d="M 1328 1946 h -1021 v -1844 h 921 l 513 512 v 449 l -103 -103 v -243 h -512 v -512 h -716 v 1638 h 1020 m -201 -1229 h 367 l -367 -366 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m24"
            d="M 1024 1536 h 828 l -337 -337 l 72 -73 l 461 461 l -461 461 l -72 -72 l 337 -338 h -828 z"
          />
        </svg>
      </FluentIcon>
    </IconButton>
  </Tooltip>

  <span class="bar" />

  <Tooltip text="Insert comment">
    {#if width > 730}
      <Button
        on:click={() => {
          if (setCommentDisabled) return;
          editor?.chain().focus().setComment(coreNewCommentAttrs).run();
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
      <IconButton
        on:click={() => {
          if (setCommentDisabled) return;
          editor?.chain().focus().setComment(coreNewCommentAttrs).run();
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
    {/if}
  </Tooltip>

  <Tooltip text="Delete comment">
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

<style>
</style>
