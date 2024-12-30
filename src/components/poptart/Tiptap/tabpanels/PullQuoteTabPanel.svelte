<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import type { Editor } from '@tiptap/core';
  import { Button, IconButton, Tooltip } from 'fluent-svelte';
  import { tick } from 'svelte';

  export let editor: Editor | null;
  export let visible = false;
  export let disabled = false;
  export let setTab: (tabName: string) => void;

  let tabWasActive = false;
  $: if (editor?.isActive('pullQuote') && tabWasActive === false) {
    setTab('pullQuote');
    tabWasActive = true;
  }
  $: if (!editor?.isActive('pullQuote') && tabWasActive === true) {
    tick().then(() => {
      if (visible) setTab('home');
      tabWasActive = false;
    });
  }

  let width = 1000;
  let position: 'center' | 'left' | 'right';
  $: position = editor?.isActive('pullQuote', { position: 'left' })
    ? 'left'
    : editor?.isActive('pullQuote', { position: 'right' })
    ? 'right'
    : 'center';

  function deletePullQuoteNode() {
    editor
      ?.chain()
      .focus()
      .selectParentNode()
      .updateAttributes('pullQuote', { position })
      .focus()
      .deleteNode('pullQuote')
      .run();
  }

  function setPosition(position: 'center' | 'left' | 'right') {
    if (!editor) return;
    editor.chain().focus().selectParentNode().updateAttributes('pullQuote', { position }).run();
  }
</script>

<div class="panel" class:visible bind:offsetWidth={width}>
  <Tooltip text="Delete pull quote">
    {#if width < 240}
      <IconButton disabled={disabled || !editor?.isActive('pullQuote')} on:click={deletePullQuoteNode}>
        <FluentIcon>
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 1096 1024 l 645 645 l -73 72 l -644 -645 l -645 645 l -72 -72 l 645 -645 l -645 -644 l 72 -73 l 645 645 l 644 -645 l 73 73 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m213"
              d="M 1096 1024 l 645 645 l -73 72 l -644 -645 l -645 645 l -72 -72 l 645 -645 l -645 -644 l 72 -73 l 645 645 l 644 -645 l 73 73 z"
            />
          </svg>
        </FluentIcon>
      </IconButton>
    {:else}
      <Button disabled={disabled || !editor?.isActive('pullQuote')} on:click={deletePullQuoteNode}>
        <FluentIcon mode="ribbonButtonIconLeft">
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 1096 1024 l 645 645 l -73 72 l -644 -645 l -645 645 l -72 -72 l 645 -645 l -645 -644 l 72 -73 l 645 645 l 644 -645 l 73 73 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m213"
              d="M 1096 1024 l 645 645 l -73 72 l -644 -645 l -645 645 l -72 -72 l 645 -645 l -645 -644 l 72 -73 l 645 645 l 644 -645 l 73 73 z"
            />
          </svg>
        </FluentIcon>
        Delete pull quote
      </Button>
    {/if}
  </Tooltip>

  <span class="bar" />

  <Tooltip text="Position left">
    {#if width < 400}
      <IconButton
        disabled={disabled || !editor?.isActive('pullQuote')}
        on:click={() => setPosition(position === 'left' ? 'center' : 'left')}
        class={position === 'left' ? 'active' : ''}
      >
        <FluentIcon>
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 205 102 v 1844 h -103 v -1844 m 1844 1024 h -1639 v -512 h 1639 m -1536 103 v 307 h 1433 v -307 m -717 -205 h -819 v -410 h 819 m -716 103 v 205 h 614 v -205 m -358 1024 l 72 72 l -235 235 h 828 v 102 h -828 l 235 235 l -72 73 l -359 -359 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 358 666 h 1536 v 409 h -1536 m 0 -921 h 717 v 307 h -717 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 205 102 v 1844 h -103 v -1844 m 1844 1024 h -1639 v -512 h 1639 m -1536 103 v 307 h 1433 v -307 m -717 -205 h -819 v -410 h 819 m -716 103 v 205 h 614 v -205 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m24"
              d="M 666 1229 l 72 72 l -235 235 h 828 v 102 h -828 l 235 235 l -72 73 l -359 -359 z"
            />
          </svg>
        </FluentIcon>
      </IconButton>
    {:else}
      <Button
        disabled={disabled || !editor?.isActive('pullQuote')}
        on:click={() => setPosition(position === 'left' ? 'center' : 'left')}
        class={position === 'left' ? 'active' : ''}
      >
        <FluentIcon mode="ribbonButtonIconLeft">
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 205 102 v 1844 h -103 v -1844 m 1844 1024 h -1639 v -512 h 1639 m -1536 103 v 307 h 1433 v -307 m -717 -205 h -819 v -410 h 819 m -716 103 v 205 h 614 v -205 m -358 1024 l 72 72 l -235 235 h 828 v 102 h -828 l 235 235 l -72 73 l -359 -359 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 358 666 h 1536 v 409 h -1536 m 0 -921 h 717 v 307 h -717 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 205 102 v 1844 h -103 v -1844 m 1844 1024 h -1639 v -512 h 1639 m -1536 103 v 307 h 1433 v -307 m -717 -205 h -819 v -410 h 819 m -716 103 v 205 h 614 v -205 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m24"
              d="M 666 1229 l 72 72 l -235 235 h 828 v 102 h -828 l 235 235 l -72 73 l -359 -359 z"
            />
          </svg>
        </FluentIcon>
        Position left
      </Button>
    {/if}
  </Tooltip>

  <!-- <Tooltip text="Position full width">
    {#if width < 720}
      <IconButton
        disabled={disabled || !editor?.isActive('pullQuote')}
        on:click={() => setPosition(position === 'center' ? 'left' : 'center')}
        class={position === 'center' ? 'active' : ''}
      >
        <FluentIcon>
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 1741 1024 v 512 h -717 v 410 h -102 v -410 h -717 v -512 h 717 v -205 h -512 v -409 h 512 v -308 h 102 v 308 h 512 v 409 h -512 v 205 m 410 -307 v -205 h -922 v 205 m 1126 409 h -1331 v 308 h 1331 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m24"
              d="M 1024 461 h -102 v -359 h 102 m 0 973 h -102 v -307 h 102 m 0 1178 h -102 v -461 h 102 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 256 1485 v -410 h 1434 v 410 m -1229 -717 v -307 h 1024 v 307 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 1741 1024 v 512 h -1536 v -512 m 1433 102 h -1331 v 308 h 1331 m -102 -1024 v 409 h -1126 v -409 m 1024 102 h -922 v 205 h 922 z"
            />
          </svg>
        </FluentIcon>
      </IconButton>
    {:else}
      <Button
        disabled={disabled || !editor?.isActive('pullQuote')}
        on:click={() => setPosition(position === 'center' ? 'left' : 'center')}
        class={position === 'center' ? 'active' : ''}
      >
        <FluentIcon mode="ribbonButtonIconLeft">
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 1741 1024 v 512 h -717 v 410 h -102 v -410 h -717 v -512 h 717 v -205 h -512 v -409 h 512 v -308 h 102 v 308 h 512 v 409 h -512 v 205 m 410 -307 v -205 h -922 v 205 m 1126 409 h -1331 v 308 h 1331 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m24"
              d="M 1024 461 h -102 v -359 h 102 m 0 973 h -102 v -307 h 102 m 0 1178 h -102 v -461 h 102 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 256 1485 v -410 h 1434 v 410 m -1229 -717 v -307 h 1024 v 307 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 1741 1024 v 512 h -1536 v -512 m 1433 102 h -1331 v 308 h 1331 m -102 -1024 v 409 h -1126 v -409 m 1024 102 h -922 v 205 h 922 z"
            />
          </svg>
        </FluentIcon>
        Full width
      </Button>
    {/if}
  </Tooltip> -->

  <Tooltip text="Position right">
    {#if width < 400}
      <IconButton
        disabled={disabled || !editor?.isActive('pullQuote')}
        on:click={() => setPosition(position === 'right' ? 'center' : 'right')}
        class={position === 'right' ? 'active' : ''}
      >
        <FluentIcon>
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 1946 102 v 1844 h -103 v -1844 m -1741 512 h 1639 v 512 h -1639 m 103 -409 v 307 h 1433 v -307 m -716 -615 h 819 v 410 h -819 m 102 -307 v 205 h 614 v -205 m 103 1382 l -359 359 l -72 -73 l 235 -235 h -828 v -102 h 828 l -235 -235 l 72 -72 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 1690 1075 h -1536 v -409 h 1536 m 0 -205 h -717 v -307 h 717 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 1946 102 v 1844 h -103 v -1844 m -1741 512 h 1639 v 512 h -1639 m 103 -409 v 307 h 1433 v -307 m -716 -615 h 819 v 410 h -819 m 102 -307 v 205 h 614 v -205 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m24"
              d="M 1741 1587 l -359 359 l -72 -73 l 235 -235 h -828 v -102 h 828 l -235 -235 l 72 -72 z"
            />
          </svg>
        </FluentIcon>
      </IconButton>
    {:else}
      <Button
        disabled={disabled || !editor?.isActive('pullQuote')}
        on:click={() => setPosition(position === 'right' ? 'center' : 'right')}
        class={position === 'right' ? 'active' : ''}
      >
        <FluentIcon mode="ribbonButtonIconLeft">
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 1946 102 v 1844 h -103 v -1844 m -1741 512 h 1639 v 512 h -1639 m 103 -409 v 307 h 1433 v -307 m -716 -615 h 819 v 410 h -819 m 102 -307 v 205 h 614 v -205 m 103 1382 l -359 359 l -72 -73 l 235 -235 h -828 v -102 h 828 l -235 -235 l 72 -72 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 1690 1075 h -1536 v -409 h 1536 m 0 -205 h -717 v -307 h 717 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 1946 102 v 1844 h -103 v -1844 m -1741 512 h 1639 v 512 h -1639 m 103 -409 v 307 h 1433 v -307 m -716 -615 h 819 v 410 h -819 m 102 -307 v 205 h 614 v -205 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m24"
              d="M 1741 1587 l -359 359 l -72 -73 l 235 -235 h -828 v -102 h 828 l -235 -235 l 72 -72 z"
            />
          </svg>
        </FluentIcon>
        Position right
      </Button>
    {/if}
  </Tooltip>
</div>

<style>
</style>
