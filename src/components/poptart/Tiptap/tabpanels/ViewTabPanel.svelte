<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import type { Editor } from '@tiptap/core';
  import { Button, IconButton, Tooltip } from 'fluent-svelte';
  import type { tiptapOptions } from '../../../../config';
  import { richTextParams } from '../richTextParams';

  export let editor: Editor | null;
  export let visible = false;
  export let disabled = false;
  export let options: tiptapOptions | undefined = undefined;

  let width = 1000;

  function toggleDocumentProperties() {
    if ($richTextParams.obj.props > 0) {
      $richTextParams.set('props', 0);
    } else {
      $richTextParams.set('props', 2);
    }
  }
  function toggleCommentsSidebar() {
    if ($richTextParams.isActive('comments')) {
      $richTextParams.set('comments', 0);
    } else {
      $richTextParams.set('comments', 1);
    }
  }
  function toggleVersionsSidebar() {
    if ($richTextParams.isActive('versions')) {
      $richTextParams.set('versions', 0);
    } else {
      $richTextParams.set('versions', 1);
    }
  }
</script>

<div class="panel" class:visible bind:offsetWidth={width}>
  <Button
    on:click={() => {
      if ($richTextParams.obj.previewMode === 0) {
        $richTextParams.set('previewMode', 2);
      } else {
        $richTextParams.set('previewMode', 0);
      }
    }}
    class={$richTextParams.obj.previewMode === 0 ? 'active' : ''}
  >
    <FluentIcon mode="ribbonButtonIconLeft">
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
    </FluentIcon>
    {#if disabled}
      Document mode
    {:else}
      Editing mode
    {/if}
  </Button>
  <Button
    on:click={() => {
      if ($richTextParams.obj.previewMode > 0) {
        $richTextParams.set('previewMode', 0);
      } else {
        $richTextParams.set('previewMode', 2);
      }
    }}
    class={$richTextParams.obj.previewMode > 0 ? 'active' : ''}
  >
    <FluentIcon mode="ribbonButtonIconLeft">
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
    </FluentIcon>
    Preview mode
  </Button>

  <span class="bar" />

  {#if width > 520}
    <Button
      on:click={toggleDocumentProperties}
      class={$richTextParams.isActive('props') ? 'active' : ''}
    >
      <FluentIcon name="Database20Regular" mode="ribbonButtonIconLeft" />
      Document properties
    </Button>
  {:else}
    <Tooltip text="Document properties">
      <IconButton
        on:click={toggleDocumentProperties}
        class={$richTextParams.isActive('props') ? 'active' : ''}
      >
        <FluentIcon name="Database20Regular" />
      </IconButton>
    </Tooltip>
  {/if}

  <!-- Comments must be enabled or there must be a comment left over from when comments were enabled -->
  <!-- In order to show the option to view the comments sidebar -->
  {#if options?.features.comment || (editor?.storage?.powerComment?.comments.length || 0) > 0}
    {#if width > 580}
      <Button
        on:click={toggleCommentsSidebar}
        class={$richTextParams.isActive('comments') ? 'active' : ''}
      >
        <FluentIcon mode="ribbonButtonIconLeft">
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
        Comments
      </Button>
    {:else}
      <Tooltip text="Comments sidebar">
        <IconButton
          on:click={toggleCommentsSidebar}
          class={$richTextParams.isActive('comments') ? 'active' : ''}
        >
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
        </IconButton>
      </Tooltip>
    {/if}
  {/if}

  {#if width > 680}
    <Button
      on:click={toggleVersionsSidebar}
      class={$richTextParams.isActive('versions') ? 'active' : ''}
    >
      <FluentIcon mode="ribbonButtonIconLeft">
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
      Version history
    </Button>
  {:else}
    <Tooltip text="Version history">
      <IconButton
        on:click={toggleVersionsSidebar}
        class={$richTextParams.isActive('versions') ? 'active' : ''}
      >
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
      </IconButton>
    </Tooltip>
  {/if}
</div>

<style>
</style>
