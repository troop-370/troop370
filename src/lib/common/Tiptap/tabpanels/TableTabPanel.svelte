<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import type { Editor } from '@tiptap/core';
  import { Button, IconButton, MenuFlyout, MenuFlyoutItem, Tooltip } from 'fluent-svelte';
  import { tick } from 'svelte';
  import type { tiptapOptions } from '../../../../config';

  export let editor: Editor | null;
  export let visible = false;
  export let disabled = false;
  export let options: tiptapOptions | undefined = undefined;
  export let setTab: (tabName: string) => void;

  let tabWasActive = false;
  $: if (editor?.can().deleteTable() && tabWasActive === false) {
    setTab('table');
    tabWasActive = true;
  }
  $: if (!editor?.can().deleteTable() && tabWasActive === true) {
    tick().then(() => {
      if (visible) setTab('home');
      tabWasActive = false;
    });
  }

  let width = 1000;
  let deleteMenuOpen = false;
  let insertMenuOpen = false;
  let headerMenuOpen = false;

  function deleteTable() {
    editor?.chain().focus().deleteTable().run();
  }
  function deleteColumn() {
    editor?.chain().focus().deleteColumn().run();
  }
  function deleteRow() {
    editor?.chain().focus().deleteRow().run();
  }
  function insertAbove() {
    editor?.chain().focus().addRowBefore().run();
  }
  function insertBelow() {
    editor?.chain().focus().addRowAfter().run();
  }
  function insertLeft() {
    editor?.chain().focus().addColumnBefore().run();
  }
  function insertRight() {
    editor?.chain().focus().addColumnAfter().run();
  }
</script>

<div class="panel" class:visible bind:offsetWidth={width}>
  <MenuFlyout alignment="start" placement="bottom" offset={0} bind:open={deleteMenuOpen}>
    <svelte:fragment slot="flyout">
      <MenuFlyoutItem disabled={disabled || !editor?.can().deleteTable()} on:click={deleteTable}>
        <FluentIcon slot="icon">
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 1602 1536 l 446 446 l -66 66 l -446 -446 l -446 446 l -66 -66 l 446 -446 l -446 -446 l 66 -66 l 446 446 l 446 -446 l 66 66 m -1000 651 l -102 102 h -844 v -1638 h 1844 v 638 l -103 103 v -127 h -512 v 229 l -102 -102 v -127 h -410 v 410 h 127 l 102 102 h -229 v 410 m -102 -922 h -512 v 410 h 512 m 512 -512 v -410 h -410 v 410 m 1024 -410 h -512 v 410 h 512 m -1638 -410 v 410 h 512 v -410 m -512 1434 h 512 v -410 h -512 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 997 1792 h -843 v -1536 h 1740 v 639 l -358 358 l -446 -446 l -283 283 l 446 446 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m23"
              d="M 1894 819 h -563 v 229 l -102 -102 v -127 h -410 v 410 h 127 l 102 102 h -229 v 461 h -102 v -461 h -563 v -102 h 563 v -410 h -563 v -102 h 563 v -461 h 102 v 461 h 410 v -461 h 102 v 461 h 563 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 946 1843 h -844 v -1638 h 1844 v 638 l -103 103 v -639 h -1638 v 1434 h 843 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m213"
              d="M 1602 1536 l 446 446 l -66 66 l -446 -446 l -446 446 l -66 -66 l 446 -446 l -446 -446 l 66 -66 l 446 446 l 446 -446 l 66 66 z"
            />
          </svg>
        </FluentIcon>
        Table
      </MenuFlyoutItem>
      <MenuFlyoutItem disabled={disabled || !editor?.can().deleteColumn()} on:click={deleteColumn}>
        <FluentIcon slot="icon">
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 614 922 h -409 v -820 h 102 v 717 h 307 m 1127 -717 v 820 h -410 v -103 h 307 v -717 m -307 1288 l -300 300 l 300 300 l -58 58 l -300 -300 l -300 300 l -59 -58 l 301 -300 l -301 -300 l 59 -59 l 300 300 l 300 -300 m -556 -173 v -1056 h 512 v 1056 l -256 256 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 614 870 h -358 v -768 h 358 m 1076 768 h -359 v -768 h 359 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 205 102 h 102 v 717 h 307 v 103 h -409 m 1536 0 h -410 v -103 h 307 v -717 h 103 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m223"
              d="M 768 1209 v -1107 h 410 v 1107 l -205 205 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m224"
              d="M 717 1158 v -1056 h 102 v 1159 m 307 0 v -1159 h 103 v 1056 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m213"
              d="M 973 1631 l 300 -300 l 58 59 l -300 300 l 300 300 l -58 58 l -300 -300 l -300 300 l -59 -58 l 301 -300 l -301 -300 l 59 -59 z"
            />
          </svg>
        </FluentIcon>
        Column
      </MenuFlyoutItem>
      <MenuFlyoutItem disabled={disabled || !editor?.can().deleteRow()} on:click={deleteRow}>
        <FluentIcon slot="icon">
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 819 307 h -717 v -102 h 820 v 409 h -103 m 0 717 h 103 v 410 h -820 v -103 h 717 m 929 -665 l 300 300 l -58 58 l -300 -300 l -300 300 l -59 -58 l 300 -300 l -300 -300 l 59 -59 l 300 301 l 300 -301 l 58 59 m -634 300 l -256 256 h -1056 v -512 h 1056 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 102 614 v -358 h 768 v 358 m -768 1076 v -359 h 768 v 359 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 922 205 v 409 h -103 v -307 h -717 v -102 m 0 1536 v -103 h 717 v -307 h 103 v 410 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m223"
              d="M 1209 1178 h -1107 v -410 h 1107 l 205 205 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m224"
              d="M 1158 1229 h -1056 v -103 h 1159 m 0 -307 h -1159 v -102 h 1056 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m213"
              d="M 1331 673 l 59 -59 l 300 301 l 300 -301 l 58 59 l -300 300 l 300 300 l -58 58 l -300 -300 l -300 300 l -59 -58 l 300 -300 z"
            />
          </svg>
        </FluentIcon>
        Row
      </MenuFlyoutItem>
    </svelte:fragment>
  </MenuFlyout>
  <Button
    disabled={disabled || !editor?.can().deleteTable()}
    on:click={() => (deleteMenuOpen = !deleteMenuOpen)}
  >
    <FluentIcon mode="ribbonButtonIconLeft">
      <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
        <path
          type="path"
          class="OfficeIconColors_HighContrast"
          d="M 1602 1536 l 446 446 l -66 66 l -446 -446 l -446 446 l -66 -66 l 446 -446 l -446 -446 l 66 -66 l 446 446 l 446 -446 l 66 66 m -1000 651 l -102 102 h -844 v -1638 h 1844 v 638 l -103 103 v -127 h -512 v 229 l -102 -102 v -127 h -410 v 410 h 127 l 102 102 h -229 v 410 m -102 -922 h -512 v 410 h 512 m 512 -512 v -410 h -410 v 410 m 1024 -410 h -512 v 410 h 512 m -1638 -410 v 410 h 512 v -410 m -512 1434 h 512 v -410 h -512 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m20"
          d="M 997 1792 h -843 v -1536 h 1740 v 639 l -358 358 l -446 -446 l -283 283 l 446 446 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m23"
          d="M 1894 819 h -563 v 229 l -102 -102 v -127 h -410 v 410 h 127 l 102 102 h -229 v 461 h -102 v -461 h -563 v -102 h 563 v -410 h -563 v -102 h 563 v -461 h 102 v 461 h 410 v -461 h 102 v 461 h 563 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m22"
          d="M 946 1843 h -844 v -1638 h 1844 v 638 l -103 103 v -639 h -1638 v 1434 h 843 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m213"
          d="M 1602 1536 l 446 446 l -66 66 l -446 -446 l -446 446 l -66 -66 l 446 -446 l -446 -446 l 66 -66 l 446 446 l 446 -446 l 66 66 z"
        />
      </svg>
    </FluentIcon>
    Delete
    <FluentIcon name="ChevronDown20Regular" mode="ribbonButtonIconRight" />
  </Button>

  <MenuFlyout alignment="start" placement="bottom" offset={0} bind:open={insertMenuOpen}>
    <svelte:fragment slot="flyout">
      <MenuFlyoutItem disabled={disabled || !editor?.can().addRowBefore()} on:click={insertAbove}>
        <FluentIcon slot="icon">
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 1946 205 v 1638 h -1844 v -1638 h 559 l -102 102 h -354 v 410 h 266 l 102 103 h 51 l 100 -103 h 95 v 409 h 307 v -409 h 96 l 101 102 h 50 l 102 -102 h 368 v -410 h -456 l -102 -102 m -466 1126 v 410 h 410 v -410 m -1024 410 h 512 v -410 h -512 m 1638 410 v -410 h -512 v 410 m -409 -717 v -718 l -323 323 l -72 -73 l 446 -446 l 446 446 l -73 73 l -322 -323 v 718 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 1894 256 v 1536 h -1740 v -1536 h 456 l -300 300 l 289 290 l 220 -228 v 508 h 307 v -508 l 220 228 l 290 -290 l -300 -300 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m23"
              d="M 1331 1280 v 514 h -102 v -514 m -410 0 v 514 h -102 v -514 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m26"
              d="M 1894 768 v 512 h -1740 v -512 h 368 l 52 52 h 50 l 50 -52 h 145 v 358 h 307 v -358 h 145 l 52 52 h 49 l 52 -52 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m25"
              d="M 1888 1331 h -1739 v -102 h 1739 m -567 -410 h -195 v -102 h 96 m 683 0 v 102 h -532 l 102 -102 m -902 102 h -421 v -102 h 319 m 253 0 h 95 v 102 h -194 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 1946 205 v 1638 h -1844 v -1638 h 559 l -102 102 h -354 v 1434 h 1638 v -1434 h -456 l -102 -102 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 527 556 l 446 -446 l 446 446 l -73 73 l -322 -323 v 718 h -102 v -718 l -323 323 z"
            />
          </svg>
        </FluentIcon>
        Above
      </MenuFlyoutItem>
      <MenuFlyoutItem disabled={disabled || !editor?.can().addRowAfter()} on:click={insertBelow}>
        <FluentIcon slot="icon">
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 1946 205 v 1638 h -661 l 102 -102 h 456 v -410 h -368 l -102 -102 h -52 l -99 102 h -96 v -409 h -307 v 409 h -95 l -99 -102 h -52 l -102 102 h -266 v 410 h 354 l 102 102 h -559 v -1638 m 1127 512 v -410 h -410 v 410 m 1024 -410 h -512 v 410 h 512 m -1638 -410 v 410 h 512 v -410 m 702 1185 l -446 446 l -446 -446 l 72 -73 l 323 323 v -718 h 102 v 718 l 322 -323 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 1894 256 v 1536 h -558 l 300 -300 l -290 -290 l -220 228 v -508 h -307 v 508 l -220 -228 l -289 290 l 300 300 h -456 v -1536 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m23"
              d="M 1229 761 v -510 h 102 v 510 m -614 0 v -510 h 102 v 510 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m26"
              d="M 1894 768 v 512 h -470 l -51 -51 h -52 l -50 51 h -145 v -358 h -307 v 358 h -145 l -49 -51 h -52 l -51 51 h -368 v -512 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m25"
              d="M 1894 819 h -1756 v -102 h 1756 m -672 614 h -96 v -102 h 195 m 566 0 v 102 h -412 l -102 -102 m -748 0 h 194 v 102 h -95 m -253 0 h -306 v -102 h 408 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 1946 205 v 1638 h -661 l 102 -102 h 456 v -1434 h -1638 v 1434 h 354 l 102 102 h -559 v -1638 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 1419 1492 l -446 446 l -446 -446 l 72 -73 l 323 323 v -718 h 102 v 718 l 322 -323 z"
            />
          </svg>
        </FluentIcon>
        Below
      </MenuFlyoutItem>
      <MenuFlyoutItem disabled={disabled || !editor?.can().addColumnBefore()} on:click={insertLeft}>
        <FluentIcon slot="icon">
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 1946 205 v 1638 h -1844 v -661 l 103 103 v 456 h 512 v -266 l 128 -128 l -128 -130 v -91 h 409 v -307 h -409 v -91 l 128 -128 l -128 -130 v -163 h -512 v 354 l -103 102 v -558 m 1741 102 h -512 v 410 h 512 m -512 512 h 512 v -410 h -512 m 512 922 v -410 h -512 v 410 m -702 -1142 l -323 323 h 718 v 102 h -718 l 323 322 l -73 73 l -446 -446 l 446 -446 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 1894 256 v 1536 h -1740 v -559 l 402 403 l 290 -290 l -220 -220 h 500 v -307 h -500 l 220 -220 l -290 -289 l -402 402 v -456 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m23"
              d="M 1894 819 h -614 v -102 h 614 m 0 614 h -614 v -102 h 614 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m223"
              d="M 1280 256 v 1536 h -512 v -368 l 78 -78 l -78 -77 v -143 h 358 v -307 h -358 v -142 l 78 -78 l -78 -77 v -266 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m224"
              d="M 1331 1792 h -102 v -1536 h 102 m -512 370 v 193 h -102 v -91 m 102 592 l -102 -103 v -91 h 102 m 0 247 v 419 h -102 v -317 m 0 -1005 v -214 h 102 v 317 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 1946 205 v 1638 h -1844 v -661 l 103 103 v 456 h 1638 v -1434 h -1638 v 354 l -103 102 v -558 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 629 599 l -323 323 h 718 v 102 h -718 l 323 322 l -73 73 l -446 -446 l 446 -446 z"
            />
          </svg>
        </FluentIcon>
        Left
      </MenuFlyoutItem>
      <MenuFlyoutItem disabled={disabled || !editor?.can().addColumnAfter()} on:click={insertRight}>
        <FluentIcon slot="icon">
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 1946 763 l -103 -102 v -354 h -511 v 164 l -130 128 l 129 129 v 91 h -409 v 307 h 410 v 92 l -130 128 l 129 129 v 266 h 512 v -456 l 103 -103 v 661 h -1844 v -1638 h 1844 m -1229 614 h -512 v 410 h 512 m -512 -922 v 410 h 512 v -410 m -512 1434 h 512 v -410 h -512 m 1214 15 l 323 -322 h -718 v -102 h 718 l -323 -323 l 73 -72 l 446 446 l -446 446 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 1894 256 v 456 l -402 -402 l -290 289 l 220 220 h -500 v 307 h 500 l -220 220 l 290 290 l 402 -403 v 559 h -1740 v -1536 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m23"
              d="M 154 717 h 614 v 102 h -614 m 0 410 h 614 v 102 h -614 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m223"
              d="M 1280 256 v 266 l -78 77 l 78 78 v 142 h -358 v 307 h 358 v 143 l -78 77 l 78 78 v 368 h -512 v -1536 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m224"
              d="M 717 256 h 102 v 1536 h -102 m 614 -1064 v 91 h -102 v -193 m 0 500 h 102 v 91 l -102 103 m 102 155 v 317 h -102 v -419 m 0 -800 v -317 h 102 v 214 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 1946 205 v 558 l -103 -102 v -354 h -1638 v 1434 h 1638 v -456 l 103 -103 v 661 h -1844 v -1638 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 1419 1346 l 323 -322 h -718 v -102 h 718 l -323 -323 l 73 -72 l 446 446 l -446 446 z"
            />
          </svg>
        </FluentIcon>
        Right
      </MenuFlyoutItem>
    </svelte:fragment>
  </MenuFlyout>
  <Button
    disabled={disabled || !editor?.can().addRowBefore()}
    on:click={() => (insertMenuOpen = !insertMenuOpen)}
  >
    <FluentIcon mode="ribbonButtonIconLeft">
      <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
        <path
          type="path"
          class="OfficeIconColors_HighContrast"
          d="M 1946 205 v 1638 h -1844 v -1638 h 559 l -102 102 h -354 v 410 h 266 l 102 103 h 51 l 100 -103 h 95 v 409 h 307 v -409 h 96 l 101 102 h 50 l 102 -102 h 368 v -410 h -456 l -102 -102 m -466 1126 v 410 h 410 v -410 m -1024 410 h 512 v -410 h -512 m 1638 410 v -410 h -512 v 410 m -409 -717 v -718 l -323 323 l -72 -73 l 446 -446 l 446 446 l -73 73 l -322 -323 v 718 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m20"
          d="M 1894 256 v 1536 h -1740 v -1536 h 456 l -300 300 l 289 290 l 220 -228 v 508 h 307 v -508 l 220 228 l 290 -290 l -300 -300 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m23"
          d="M 1331 1280 v 514 h -102 v -514 m -410 0 v 514 h -102 v -514 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m26"
          d="M 1894 768 v 512 h -1740 v -512 h 368 l 52 52 h 50 l 50 -52 h 145 v 358 h 307 v -358 h 145 l 52 52 h 49 l 52 -52 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m25"
          d="M 1888 1331 h -1739 v -102 h 1739 m -567 -410 h -195 v -102 h 96 m 683 0 v 102 h -532 l 102 -102 m -902 102 h -421 v -102 h 319 m 253 0 h 95 v 102 h -194 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m22"
          d="M 1946 205 v 1638 h -1844 v -1638 h 559 l -102 102 h -354 v 1434 h 1638 v -1434 h -456 l -102 -102 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m22"
          d="M 527 556 l 446 -446 l 446 446 l -73 73 l -322 -323 v 718 h -102 v -718 l -323 323 z"
        />
      </svg>
    </FluentIcon>
    Insert
    <FluentIcon name="ChevronDown20Regular" mode="ribbonButtonIconRight" />
  </Button>

  <Tooltip text="Merge cells">
    {#if width < 500}
      <IconButton
        disabled={disabled || !editor?.can().mergeCells()}
        on:click={() => editor?.chain().focus().mergeCells().run()}
      >
        <FluentIcon>
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 1843 102 v 1741 h -1741 v -1741 m 103 512 h 717 v -409 h -717 m 717 1536 v -410 h -717 v 410 m 1536 -410 h -717 v 410 h 717 m 0 -1024 h -1536 v 512 h 1536 m 0 -1024 h -717 v 409 h 717 z"
            />
            <path type="path" class="OfficeIconColors_m20" d="M 154 1792 v -1638 h 1638 v 1638 z" />
            <path
              type="path"
              class="OfficeIconColors_m23"
              d="M 1024 1331 v 410 h -102 v -410 m 0 -614 v -512 h 102 v 512 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 1843 102 v 1741 h -1741 v -1741 m 1639 103 h -1536 v 1536 h 1536 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m24"
              d="M 1843 614 v 717 h -1741 v -717 m 1639 103 h -1536 v 512 h 1536 z"
            />
          </svg>
        </FluentIcon>
      </IconButton>
    {:else}
      <Button
        disabled={disabled || !editor?.can().mergeCells()}
        on:click={() => editor?.chain().focus().mergeCells().run()}
      >
        <FluentIcon mode="ribbonButtonIconLeft">
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 1843 102 v 1741 h -1741 v -1741 m 103 512 h 717 v -409 h -717 m 717 1536 v -410 h -717 v 410 m 1536 -410 h -717 v 410 h 717 m 0 -1024 h -1536 v 512 h 1536 m 0 -1024 h -717 v 409 h 717 z"
            />
            <path type="path" class="OfficeIconColors_m20" d="M 154 1792 v -1638 h 1638 v 1638 z" />
            <path
              type="path"
              class="OfficeIconColors_m23"
              d="M 1024 1331 v 410 h -102 v -410 m 0 -614 v -512 h 102 v 512 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 1843 102 v 1741 h -1741 v -1741 m 1639 103 h -1536 v 1536 h 1536 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m24"
              d="M 1843 614 v 717 h -1741 v -717 m 1639 103 h -1536 v 512 h 1536 z"
            />
          </svg>
        </FluentIcon>
        Merge cells
      </Button>
    {/if}
  </Tooltip>

  <Tooltip text="Split cell">
    {#if width < 500}
      <IconButton
        disabled={disabled || !editor?.can().splitCell()}
        on:click={() => editor?.chain().focus().splitCell().run()}
      >
        <FluentIcon>
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 1843 102 v 1741 h -1741 v -1741 m 103 512 h 717 v -409 h -717 m 1229 1024 h 307 v -512 h -307 m -103 0 h -307 v 512 h 307 m -819 -512 h -307 v 512 h 307 m 102 0 h 308 v -512 h -308 m 308 1024 v -410 h -717 v 410 m 1536 -410 h -717 v 410 h 717 m 0 -1127 v -409 h -717 v 409 z"
            />
            <path type="path" class="OfficeIconColors_m20" d="M 154 1792 v -1638 h 1638 v 1638 z" />
            <path
              type="path"
              class="OfficeIconColors_m23"
              d="M 1024 1331 v 410 h -102 v -410 m 0 -614 v -512 h 102 v 512 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 1843 102 v 1741 h -1741 v -1741 m 1639 103 h -1536 v 1536 h 1536 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m24"
              d="M 1843 614 v 717 h -1741 v -717 m 410 615 v -512 h -307 v 512 m 717 0 v -512 h -308 v 512 m 717 0 v -512 h -307 v 512 m 717 -512 h -307 v 512 h 307 z"
            />
          </svg>
        </FluentIcon>
      </IconButton>
    {:else}
      <Button
        disabled={disabled || !editor?.can().splitCell()}
        on:click={() => editor?.chain().focus().splitCell().run()}
      >
        <FluentIcon mode="ribbonButtonIconLeft">
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 1843 102 v 1741 h -1741 v -1741 m 103 512 h 717 v -409 h -717 m 1229 1024 h 307 v -512 h -307 m -103 0 h -307 v 512 h 307 m -819 -512 h -307 v 512 h 307 m 102 0 h 308 v -512 h -308 m 308 1024 v -410 h -717 v 410 m 1536 -410 h -717 v 410 h 717 m 0 -1127 v -409 h -717 v 409 z"
            />
            <path type="path" class="OfficeIconColors_m20" d="M 154 1792 v -1638 h 1638 v 1638 z" />
            <path
              type="path"
              class="OfficeIconColors_m23"
              d="M 1024 1331 v 410 h -102 v -410 m 0 -614 v -512 h 102 v 512 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 1843 102 v 1741 h -1741 v -1741 m 1639 103 h -1536 v 1536 h 1536 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m24"
              d="M 1843 614 v 717 h -1741 v -717 m 410 615 v -512 h -307 v 512 m 717 0 v -512 h -308 v 512 m 717 0 v -512 h -307 v 512 m 717 -512 h -307 v 512 h 307 z"
            />
          </svg>
        </FluentIcon>
        Split cell
      </Button>
    {/if}
  </Tooltip>

  <MenuFlyout
    alignment={width > 560 ? 'start' : 'end'}
    class={width > 560 ? '' : 'header-flyout--align-end'}
    placement="bottom"
    offset={0}
    bind:open={headerMenuOpen}
  >
    <svelte:fragment slot="flyout">
      <MenuFlyoutItem
        disabled={disabled || !editor?.can().toggleHeaderRow()}
        on:click={() => editor?.chain().focus().toggleHeaderRow().run()}
      >
        Toggle header row
      </MenuFlyoutItem>
      <MenuFlyoutItem
        disabled={disabled || !editor?.can().toggleHeaderColumn()}
        on:click={() => editor?.chain().focus().toggleHeaderColumn().run()}
      >
        Toggle header column
      </MenuFlyoutItem>
      <MenuFlyoutItem
        disabled={disabled || !editor?.can().toggleHeaderCell()}
        on:click={() => editor?.chain().focus().toggleHeaderCell().run()}
      >
        Toggle header cell
      </MenuFlyoutItem>
    </svelte:fragment>
  </MenuFlyout>
  <Button
    disabled={disabled ||
      (!editor?.can().toggleHeaderRow() &&
        !editor?.can().toggleHeaderColumn() &&
        !editor?.can().toggleHeaderCell())}
    on:click={() => (headerMenuOpen = !headerMenuOpen)}
  >
    <FluentIcon mode="ribbonButtonIconLeft">
      <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
        <path
          type="path"
          class="OfficeIconColors_HighContrast"
          d="M 102 205 h 1844 v 1638 h -1844 m 1127 -614 v -410 h -410 v 410 m -102 0 v -410 h -512 v 410 m 0 512 h 512 v -410 h -512 m 614 410 h 410 v -410 h -410 m 1024 410 v -410 h -512 v 410 m 512 -512 v -410 h -512 v 410 z"
        />
        <path type="path" class="OfficeIconColors_m20" d="M 154 1792 v -1536 h 1740 v 1536 z" />
        <path type="path" class="OfficeIconColors_m223" d="M 1894 768 h -1740 v -512 h 1740 z" />
        <path
          type="path"
          class="OfficeIconColors_m224"
          d="M 1331 717 h 512 v 102 h -1638 v -102 h 512 v -410 h 102 v 410 h 410 v -410 h 102 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m23"
          d="M 1331 1229 h 512 v 102 h -512 v 410 h -102 v -410 h -410 v 410 h -102 v -410 h -512 v -102 h 512 v -410 h 102 v 410 h 410 v -410 h 102 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m22"
          d="M 102 205 h 1844 v 1638 h -1844 m 1741 -102 v -1434 h -1638 v 1434 z"
        />
      </svg>
    </FluentIcon>
    {#if width > 560}
      Header styles
    {/if}
    <FluentIcon name="ChevronDown20Regular" mode="ribbonButtonIconRight" />
  </Button>
</div>

<style>
  :global(.header-flyout--align-end .menu-flyout-anchor) {
    inset-inline-end: -58px !important;
  }
</style>
