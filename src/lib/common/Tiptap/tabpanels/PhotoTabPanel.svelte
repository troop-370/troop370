<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import PhotoWidgetDialog from '$lib/dialogs/PhotoWidgetDialog.svelte';
  import type { Editor } from '@tiptap/core';
  import { Button, IconButton, Tooltip } from 'fluent-svelte';
  import { tick } from 'svelte';

  export let editor: Editor | null;
  export let visible = false;
  export let disabled = false;
  export let setTab: (tabName: string) => void;

  let photoTabWasActive = false;
  $: if (editor?.isActive('photoWidget') && photoTabWasActive === false) {
    setTab('photo');
    photoTabWasActive = true;
  }
  $: if (!editor?.isActive('photoWidget') && photoTabWasActive === true) {
    tick().then(() => {
      if (visible) setTab('home');
      photoTabWasActive = false;
    });
  }

  let width = 1000;
  let position: 'center' | 'left' | 'right';
  $: position = editor?.isActive('photoWidget', { position: 'left' })
    ? 'left'
    : editor?.isActive('photoWidget', { position: 'right' })
    ? 'right'
    : 'center';

  let photoWidgetDialogOpen = false;
  $: if (!editor?.isActive('photoWidget')) photoWidgetDialogOpen = false;

  function deletePhotoNode() {
    editor
      ?.chain()
      .focus()
      .selectParentNode()
      .updateAttributes('photoWidget', { showCaption: true })
      .focus()
      .deleteNode('photoWidget')
      .run();
  }

  function setPosition(position: 'center' | 'left' | 'right') {
    if (!editor) return;
    editor.chain().focus().selectParentNode().updateAttributes('photoWidget', { position }).run();
  }
</script>

<div class="panel" class:visible bind:offsetWidth={width}>
  <PhotoWidgetDialog
    bind:open={photoWidgetDialogOpen}
    title="Change photo"
    handleSumbit={async (photoId) => {
      editor?.chain().focus().selectParentNode().updateAttributes('photoWidget', { photoId }).run();
    }}
  />
  <Tooltip text="Change to a different photo">
    {#if width < 380}
      <IconButton
        disabled={disabled || !editor?.isActive('photoWidget')}
        on:click={() => (photoWidgetDialogOpen = !photoWidgetDialogOpen)}
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
    {:else}
      <Button
        disabled={disabled || !editor?.isActive('photoWidget')}
        on:click={() => (photoWidgetDialogOpen = !photoWidgetDialogOpen)}
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
        Change photo
      </Button>
    {/if}
  </Tooltip>

  <Tooltip text="Delete the photo widget">
    {#if width < 480}
      <IconButton disabled={disabled || !editor?.isActive('photoWidget')} on:click={deletePhotoNode}>
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
      <Button disabled={disabled || !editor?.isActive('photoWidget')} on:click={deletePhotoNode}>
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
        Delete photo
      </Button>
    {/if}
  </Tooltip>

  <span class="bar" />

  <Tooltip text="Position left">
    {#if width < 720}
      <IconButton
        disabled={disabled || !editor?.isActive('photoWidget')}
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
        disabled={disabled || !editor?.isActive('photoWidget')}
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

  <Tooltip text="Position full width">
    {#if width < 720}
      <IconButton
        disabled={disabled || !editor?.isActive('photoWidget')}
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
        disabled={disabled || !editor?.isActive('photoWidget')}
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
  </Tooltip>

  <Tooltip text="Position right">
    {#if width < 720}
      <IconButton
        disabled={disabled || !editor?.isActive('photoWidget')}
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
        disabled={disabled || !editor?.isActive('photoWidget')}
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

  <span class="bar" />

  <Tooltip text="{editor?.isActive('photoWidget', { showCaption: true }) ? 'Hide' : 'Show'} photo caption">
    {#if width < 310}
      <IconButton
        disabled={disabled || !editor?.isActive('photoWidget')}
        on:click={() => {
          if (!editor) return;
          const captionShown = editor.isActive('photoWidget', { showCaption: true });
          editor
            .chain()
            .focus()
            .selectParentNode()
            .updateAttributes('photoWidget', { showCaption: !captionShown })
            .run();
        }}
        class={editor?.isActive('photoWidget', { showCaption: true }) ? 'active' : ''}
      >
        <FluentIcon>
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 1741 102 v 1844 h -1434 v -1844 m 1331 103 h -1228 v 1638 h 1228 m -204 -1229 h -820 v -102 h 820 m 0 410 h -820 v -103 h 820 m 0 410 h -820 v -103 h 820 m 0 410 h -820 v -102 h 820 z"
            />
            <path type="path" class="OfficeIconColors_m20" d="M 1690 1894 h -1332 v -1740 h 1332 z" />
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
      </IconButton>
    {:else}
      <Button
        disabled={disabled || !editor?.isActive('photoWidget')}
        on:click={() => {
          if (!editor) return;
          const captionShown = editor.isActive('photoWidget', { showCaption: true });
          editor
            .chain()
            .focus()
            .selectParentNode()
            .updateAttributes('photoWidget', { showCaption: !captionShown })
            .run();
        }}
        class={editor?.isActive('photoWidget', { showCaption: true }) ? 'active' : ''}
      >
        <FluentIcon mode="ribbonButtonIconLeft">
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 1741 102 v 1844 h -1434 v -1844 m 1331 103 h -1228 v 1638 h 1228 m -204 -1229 h -820 v -102 h 820 m 0 410 h -820 v -103 h 820 m 0 410 h -820 v -103 h 820 m 0 410 h -820 v -102 h 820 z"
            />
            <path type="path" class="OfficeIconColors_m20" d="M 1690 1894 h -1332 v -1740 h 1332 z" />
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
        Caption
      </Button>
    {/if}
  </Tooltip>
</div>

<style>
</style>
