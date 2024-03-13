<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import type { Editor } from '@tiptap/core';
  import { Button, IconButton } from 'fluent-svelte';
  import type { tiptapOptions } from '../../../../config';

  export let editor: Editor | null;
  export let visible = false;
  export let disabled = false;
  export let options: tiptapOptions | undefined = undefined;
</script>

<div class="panel" class:visible>
  <Button disabled={disabled || true}>
    <FluentIcon mode="ribbonButtonIconLeft">
      <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
        <path
          type="path"
          class="OfficeIconColors_HighContrast"
          d="M 1946 205 h -1844 v -103 h 1844 m 0 1332 h -820 v -103 h 820 m 0 -717 h -820 v -102 h 820 m 0 512 h -820 v -102 h 820 m 0 921 h -1844 v -102 h 1844 m -1383 -410 l -72 -72 l 234 -235 h -623 v -102 h 623 l -234 -235 l 72 -73 l 359 359 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m22"
          d="M 1946 205 h -1844 v -103 h 1844 m 0 1332 h -820 v -103 h 820 m 0 -717 h -820 v -102 h 820 m 0 512 h -820 v -102 h 820 m 0 921 h -1844 v -102 h 1844 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m24"
          d="M 563 1331 l -72 -72 l 234 -235 h -623 v -102 h 623 l -234 -235 l 72 -73 l 359 359 z"
        />
      </svg>
    </FluentIcon>
    Indent left
  </Button>
  <Button disabled={disabled || true}>
    <FluentIcon mode="ribbonButtonIconLeft">
      <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
        <path
          type="path"
          class="OfficeIconColors_HighContrast"
          d="M 102 1741 h 1844 v 102 h -1844 m 0 -1331 h 820 v 102 h -820 m 0 717 h 820 v 103 h -820 m 0 -512 h 820 v 102 h -820 m 0 -922 h 1844 v 103 h -1844 m 1383 409 l 72 73 l -234 235 h 623 v 102 h -623 l 234 235 l -72 72 l -359 -358 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m22"
          d="M 102 1741 h 1844 v 102 h -1844 m 0 -1331 h 820 v 102 h -820 m 0 717 h 820 v 103 h -820 m 0 -512 h 820 v 102 h -820 m 0 -922 h 1844 v 103 h -1844 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m24"
          d="M 1485 614 l 72 73 l -234 235 h 623 v 102 h -623 l 234 235 l -72 72 l -359 -358 z"
        />
      </svg>
    </FluentIcon>
    Indent right
  </Button>
  <IconButton disabled={disabled || true}>
    <FluentIcon>
      <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
        <path
          type="path"
          class="OfficeIconColors_HighContrast"
          d="M 614 307 h 1332 v 103 h -1332 m -512 307 h 1844 v 102 h -1844 m 0 307 h 820 v 103 h -820 m 0 307 h 820 v 102 h -820 m 1844 -512 h -14 q -26 2 -45 13 q -17 10 -30 31 q -14 21 -14 59 v 717 h -102 v -820 h -103 q -21 0 -39 8 q -19 8 -33 22 q -14 14 -22 33 q -8 19 -8 40 v 717 h -102 v -410 q -5 1 -8 1 q -4 0 -9 0 q -9 0 -17 -1 q -9 0 -18 0 q -53 0 -99 -20 q -47 -20 -82 -55 q -35 -35 -55 -82 q -20 -46 -20 -99 q 0 -53 20 -100 q 20 -46 55 -81 q 35 -35 82 -55 q 46 -20 99 -20 h 564 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m22"
          d="M 614 307 h 1332 v 103 h -1332 m -512 307 h 1844 v 102 h -1844 m 0 307 h 820 v 103 h -820 m 0 307 h 820 v 102 h -820 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m22"
          d="M 1946 1126 h -14 q -26 2 -45 13 q -17 10 -30 31 q -14 21 -14 59 v 717 h -102 v -820 h -103 q -21 0 -39 8 q -19 8 -33 22 q -14 14 -22 33 q -8 19 -8 40 v 717 h -102 v -410 q -5 1 -8 1 q -4 0 -9 0 q -9 0 -17 -1 q -9 0 -18 0 q -53 0 -99 -20 q -47 -20 -82 -55 q -35 -35 -55 -82 q -20 -46 -20 -99 q 0 -53 20 -100 q 20 -46 55 -81 q 35 -35 82 -55 q 46 -20 99 -20 h 564 z"
        />
      </svg>
    </FluentIcon>
  </IconButton>
</div>

<style>
</style>
