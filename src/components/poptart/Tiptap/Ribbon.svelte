<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import type { Editor } from '@tiptap/core';
  import {
    Button,
    IconButton,
    MenuFlyout,
    MenuFlyoutDivider,
    MenuFlyoutItem,
    ProgressRing,
  } from 'fluent-svelte';
  import type { ComponentProps } from 'svelte';
  import type { tiptapOptions } from '.';
  import type { Action } from '../../../routes/(admin)/poptart/cms/collection/[uid]/[documentId]/+page';
  import type Tiptap from './Tiptap.svelte';
  import { downloadEmailHTML } from './downloadEmailHTML';
  import { downloadHTML } from './downloadHTML';
  import { downloadJSON } from './downloadJSON';
  import { richTextParams } from './richTextParams';
  import HomeTabPanel from './tabpanels/HomeTabPanel.svelte';
  import InsertTabPanel from './tabpanels/InsertTabPanel.svelte';
  import LayoutTabPanel from './tabpanels/LayoutTabPanel.svelte';
  import PhotoTabPanel from './tabpanels/PhotoTabPanel.svelte';
  import PullQuoteTabPanel from './tabpanels/PullQuoteTabPanel.svelte';
  import ReviewTabPanel from './tabpanels/ReviewTabPanel.svelte';
  import TableTabPanel from './tabpanels/TableTabPanel.svelte';
  import ViewTabPanel from './tabpanels/ViewTabPanel.svelte';
  import YoutubeTabPanel from './tabpanels/YoutubeTabPanel.svelte';

  export let editor: Editor | null;
  export let disabled = false;
  export let options: tiptapOptions | undefined = undefined;
  export let user: ComponentProps<Tiptap>['user'] | null = null;
  // export let awareness: Readable<AwarenessUser[] | null> | undefined;
  export let trackChanges: boolean | undefined;
  export let toggleTrackChanges: (bool: boolean) => void;
  export let iframehtmlstring = '';
  export let actions: Action[] = [];
  export let docStatsDialogOpen = false;

  let tabsContainerElement: HTMLDivElement;
  let activeTab = 'home';
  let mouseOverActiveTab = false;
  $: ({ activeTabWidth, activeTabLeft } = (() => {
    const tabsContainerRect = tabsContainerElement?.getBoundingClientRect();
    const activeTabRect = tabsContainerElement
      ?.querySelector(`[data-tab='${activeTab}']`)
      ?.getBoundingClientRect();
    return {
      activeTabWidth: (activeTabRect?.width || 0) - (mouseOverActiveTab ? 0 : 22),
      activeTabLeft:
        (activeTabRect?.left || 0) - (tabsContainerRect?.left || 0) + (mouseOverActiveTab ? 0 : 11),
    };
  })());

  function handleTabClick(evt: CustomEvent) {
    const target = evt.target as HTMLElement | undefined;
    const clickedTabName = target?.getAttribute('data-tab');
    if (clickedTabName) {
      activeTab = clickedTabName;
      mouseOverActiveTab = true;
    }
  }

  function setTab(tabName: string) {
    activeTab = tabName;
  }

  function handleTabMouseEnter(evt: CustomEvent) {
    const target = evt.target as HTMLElement | undefined;
    const tabName = target?.getAttribute('data-tab');
    if (tabName === activeTab) mouseOverActiveTab = true;
    else mouseOverActiveTab = false;
  }

  function handleTabMouseLeave(evt: CustomEvent) {
    const target = evt.target as HTMLElement | undefined;
    const tabName = target?.getAttribute('data-tab');
    if (tabName === activeTab) mouseOverActiveTab = false;
    else mouseOverActiveTab = false;
  }

  function exportJSON() {
    if (editor) {
      downloadJSON(editor);
    }
  }

  function exportHTML() {
    if (editor) {
      downloadHTML(editor, iframehtmlstring);
    }
  }

  function exportEmailHTML() {
    if (editor) {
      downloadEmailHTML(editor, iframehtmlstring, options?.css);
    }
  }

  let width = 1000;

  let fileMenuOpen = false;
  let modeMenuOpen = false;

  $: publishAction = actions.find((action) => action.id === 'publish');
  $: shareAction = actions.find((action) => action.id === 'share');
  $: saveAction = actions.find((action) => action.id === 'save');
  $: restActions = actions.filter(
    (action) =>
      action.id !== publishAction?.id &&
      action.id !== shareAction?.id &&
      action.id !== saveAction?.id
  );
</script>

<div class="ribbon" bind:offsetWidth={width}>
  <div style="padding: 0 8px;">
    <div class="top">
      <div class="tabs" bind:this={tabsContainerElement}>
        <MenuFlyout alignment="start" placement="bottom" offset={0} bind:open={fileMenuOpen}>
          <svelte:fragment slot="flyout">
            {#if saveAction}
              {@const { action, disabled, onAuxClick, tooltip, icon, label, loading, hint } =
                saveAction}
              <MenuFlyoutItem
                {hint}
                disabled={disabled || loading}
                on:click={async (evt) => {
                  await action(evt);
                  setTimeout(() => {
                    fileMenuOpen = false;
                  }, 1);
                }}
                on:auxclick={onAuxClick}
                data-tip={tooltip}
              >
                {#if loading}
                  <ProgressRing size={16} />
                {:else}
                  <FluentIcon name={icon} mode="buttonIconLeft" />
                {/if}
                {label}
              </MenuFlyoutItem>
            {/if}
            {#if publishAction}
              {@const { action, disabled, onAuxClick, tooltip, icon, label, loading, hint } =
                publishAction}
              <MenuFlyoutItem
                {hint}
                disabled={disabled || loading}
                on:click={async (evt) => {
                  await action(evt);
                  setTimeout(() => {
                    fileMenuOpen = false;
                  }, 1);
                }}
                on:auxclick={onAuxClick}
                data-tip={tooltip}
              >
                {#if loading}
                  <ProgressRing size={16} />
                {:else}
                  <FluentIcon name={icon} mode="buttonIconLeft" />
                {/if}
                {label}
              </MenuFlyoutItem>
            {/if}
            <MenuFlyoutDivider />
            <MenuFlyoutItem hint="Ctrl + P" disabled>
              <FluentIcon name="Print20Regular" />
              Print
            </MenuFlyoutItem>
            <MenuFlyoutItem cascading>
              <FluentIcon name="ArrowExportUp20Regular" />
              Export
              <svelte:fragment slot="flyout">
                <MenuFlyoutItem on:click={exportJSON}
                  >JavaScript Object Notation (.json)</MenuFlyoutItem
                >
                <MenuFlyoutItem on:click={exportHTML}>Web Page (.html)</MenuFlyoutItem>
                <MenuFlyoutItem on:click={exportEmailHTML}>Email-ready HTML (.html)</MenuFlyoutItem>
              </svelte:fragment>
            </MenuFlyoutItem>
            {#if shareAction}
              {@const { action, disabled, onAuxClick, tooltip, icon, label, loading, hint } =
                shareAction}
              <MenuFlyoutItem
                {hint}
                disabled={disabled || loading}
                on:click={async (evt) => {
                  await action(evt);
                  setTimeout(() => {
                    fileMenuOpen = false;
                  }, 1);
                }}
                on:auxclick={onAuxClick}
                data-tip={tooltip}
              >
                {#if loading}
                  <ProgressRing size={16} />
                {:else}
                  <FluentIcon name={icon} mode="buttonIconLeft" />
                {/if}
                {label}
              </MenuFlyoutItem>
            {/if}
            <MenuFlyoutDivider />
            {#each restActions as { action, disabled, onAuxClick, tooltip, icon, label, id, loading, hint }}
              <MenuFlyoutItem
                disabled={disabled || loading}
                on:click={async (evt) => {
                  await action(evt);
                  setTimeout(() => {
                    fileMenuOpen = false;
                  }, 10);
                }}
                on:auxclick={onAuxClick}
                data-tip={tooltip}
                {hint}
              >
                {#if loading}
                  <ProgressRing size={16} />
                {:else}
                  <FluentIcon name={icon} />
                {/if}
                {label}
              </MenuFlyoutItem>
            {/each}
          </svelte:fragment>
        </MenuFlyout>
        <Button on:click={() => (fileMenuOpen = !fileMenuOpen)}>File</Button>
        {#if width > 400}
          <Button
            data-tab={'home'}
            on:click={handleTabClick}
            on:mouseenter={handleTabMouseEnter}
            on:mouseleave={handleTabMouseLeave}
          >
            Home
          </Button>
          <Button
            data-tab={'insert'}
            on:click={handleTabClick}
            on:mouseenter={handleTabMouseEnter}
            on:mouseleave={handleTabMouseLeave}
          >
            Insert
          </Button>
          <!-- <Button
            data-tab={'layout'}
            on:click={handleTabClick}
            on:mouseenter={handleTabMouseEnter}
            on:mouseleave={handleTabMouseLeave}
          >
            Layout
          </Button> -->
          <Button
            data-tab={'review'}
            on:click={handleTabClick}
            on:mouseenter={handleTabMouseEnter}
            on:mouseleave={handleTabMouseLeave}
          >
            Review
          </Button>
          <Button
            data-tab={'view'}
            on:click={handleTabClick}
            on:mouseenter={handleTabMouseEnter}
            on:mouseleave={handleTabMouseLeave}
          >
            View
          </Button>
          {#if editor?.isActive('youtubeWidget') && options?.features.widgets?.youtube}
            <Button
              data-tab="youtube"
              data-contextual="true"
              on:click={handleTabClick}
              on:mouseenter={handleTabMouseEnter}
              on:mouseleave={handleTabMouseLeave}
            >
              YouTube
            </Button>
          {/if}
          {#if editor?.isActive('photoWidget') && options?.features.widgets?.photoWidget}
            <Button
              data-tab="photo"
              data-contextual="true"
              on:click={handleTabClick}
              on:mouseenter={handleTabMouseEnter}
              on:mouseleave={handleTabMouseLeave}
            >
              Photo
            </Button>
          {/if}
          {#if editor?.isActive('pullQuote') && options?.features.pullQuote}
            <Button
              data-tab="pullQuote"
              data-contextual="true"
              on:click={handleTabClick}
              on:mouseenter={handleTabMouseEnter}
              on:mouseleave={handleTabMouseLeave}
            >
              Pull Quote
            </Button>
          {/if}
          {#if editor?.can().deleteTable() && options?.features.tables}
            <Button
              data-tab="table"
              data-contextual="true"
              on:click={handleTabClick}
              on:mouseenter={handleTabMouseEnter}
              on:mouseleave={handleTabMouseLeave}
            >
              Table
            </Button>
          {/if}
          <div class="tabline" style="width: {activeTabWidth}px; left: {activeTabLeft}px;" />
        {/if}
      </div>
      <div class="focuszone">
        <!-- current editors on this document -->
        <div class="au">
          <!-- {#if $awareness && $richTextParams.isActive('fs')}
            {#each $awareness as user}
              <Tooltip text={user.name} delay={0} alignment="center" placement="bottom" offset={0}>
                <IconButton
                  href={`/${$page.params.tenant}/profile/${user._id}`}
                  class="awareness-user"
                  on:click={(evt) => {
                    evt.preventDefault();
                    openWindow(
                      `/${$page.params.tenant}/profile/${user._id}`,
                      'tiptap_awareness_user' + user._id,
                      'location=no',
                      { width: 500, height: 700 }
                    );
                  }}
                >
                  <PersonPicture
                    size={21.2}
                    src={user.photo}
                    alt={user.name}
                    class="ribbon-person-picture"
                    style="color: {user.color};"
                  />
                </IconButton>
              </Tooltip>
            {/each}
          {/if} -->
        </div>

        {#if $richTextParams.isActive('fs') && (options?.features.comment || (editor?.storage?.powerComment?.comments.length || 0) > 0)}
          <Button
            on:click={() => {
              if ($richTextParams.isActive('comments')) {
                $richTextParams.set('comments', 0);
              } else {
                $richTextParams.set('comments', 1);
              }
            }}
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
        {/if}

        {#if $richTextParams.isActive('fs')}
          <div style="display: flex;">
            <Button
              {disabled}
              on:click={() => (modeMenuOpen = !modeMenuOpen)}
              variant={trackChanges ? 'accent' : 'standard'}
            >
              {#if disabled}
                <FluentIcon mode="ribbonButtonIconLeft">
                  <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
                    <path
                      type="path"
                      class="OfficeIconColors_HighContrast"
                      d="M 820 1462 q 0 3 1 19 q 0 16 1 36 q 1 21 3 42 q 2 21 4 34 l -171 170 l -556 183 l 195 -574 l 1203 -1203 q 38 -38 87 -57 q 49 -19 102 -19 q 56 0 105 21 q 49 22 86 58 q 36 37 57 85 q 21 48 21 102 q 0 52 -20 101 q -20 49 -59 88 l -282 281 q -14 -2 -35 -4 q -22 -2 -43 -3 q -21 -1 -37 -2 q -17 0 -20 0 l 207 -206 l -235 -235 l -995 996 q 85 26 147 87 q 61 62 87 147 m 833 -1302 l 235 235 l 66 -66 q 24 -24 37 -55 q 12 -30 12 -62 q 0 -33 -13 -63 q -13 -30 -35 -53 q -23 -22 -53 -36 q -31 -13 -66 -13 q -32 0 -63 12 q -31 12 -54 35 m -987 1440 q -6 -43 -24 -80 q -19 -37 -48 -66 q -29 -29 -66 -48 q -37 -18 -80 -24 l -127 345 m 1245 -886 q 117 0 220 44 q 102 44 179 120 q 76 77 120 179 q 44 103 44 220 q 0 117 -44 219 q -44 103 -120 179 q -77 77 -179 121 q -103 44 -220 44 q -117 0 -219 -44 q -103 -44 -179 -121 q -77 -76 -121 -179 q -44 -102 -44 -219 q 0 -117 44 -220 q 44 -102 121 -179 q 76 -76 179 -120 q 102 -44 219 -44 m -461 563 q 0 95 37 179 q 36 84 99 146 q 62 63 146 99 q 84 37 179 37 q 81 0 154 -28 q 72 -27 132 -75 l -645 -644 q -48 60 -75 132 q -27 72 -27 154 m 819 286 q 48 -60 76 -133 q 27 -72 27 -153 q 0 -95 -36 -179 q -37 -84 -99 -147 q -63 -62 -147 -99 q -84 -36 -179 -36 q -82 0 -154 27 q -72 27 -132 75 z"
                    />
                    <path
                      type="path"
                      class="OfficeIconColors_m20"
                      d="M 1485 1997 q -106 0 -199 -41 q -93 -40 -162 -110 q -70 -69 -110 -162 q -41 -93 -41 -199 q 0 -106 41 -199 q 40 -93 110 -163 q 69 -69 162 -110 q 93 -40 199 -40 q 106 0 199 40 q 93 41 163 110 q 69 70 110 163 q 40 93 40 199 q 0 106 -40 199 q -41 93 -110 162 q -70 70 -163 110 q -93 41 -199 41 m -666 -512 q 0 24 3 49 l -182 181 l -486 179 l 179 -486 l 1203 -1203 q 32 -32 72 -48 q 39 -16 81 -16 q 44 0 84 17 q 39 18 69 48 q 30 30 48 69 q 17 40 17 84 q 0 42 -16 81 q -16 40 -48 72 l -309 310 q -26 -3 -49 -3 q -138 0 -259 52 q -121 53 -211 143 q -91 91 -143 212 q -53 121 -53 259 z"
                    />
                    <path
                      type="path"
                      class="OfficeIconColors_m22"
                      d="M 820 1462 q 0 3 1 19 q 0 16 1 36 q 1 21 3 42 q 2 21 4 34 l -171 170 l -556 183 l 195 -574 l 1203 -1203 q 38 -38 86 -57 q 48 -19 99 -19 q 57 0 107 21 q 50 21 87 57 q 36 36 58 84 q 21 49 21 104 q 0 52 -20 101 q -20 49 -59 88 l -282 281 q -14 -2 -35 -4 q -22 -2 -43 -3 q -21 -1 -37 -2 q -17 0 -20 0 l 207 -206 l -235 -235 l -995 996 q 85 26 147 87 q 61 62 87 147 m 833 -1302 l 235 235 l 66 -66 q 24 -24 37 -55 q 12 -30 12 -62 q 0 -33 -13 -63 q -13 -30 -35 -53 q -23 -22 -53 -36 q -31 -13 -66 -13 q -32 0 -63 12 q -31 12 -54 35 m -987 1440 q -6 -43 -24 -80 q -19 -37 -48 -66 q -29 -29 -66 -48 q -37 -18 -80 -24 l -127 345 z"
                    />
                    <path
                      type="path"
                      class="OfficeIconColors_m213"
                      d="M 1485 922 q 117 0 220 44 q 102 44 179 120 q 76 77 120 179 q 44 103 44 220 q 0 117 -44 219 q -44 103 -120 179 q -77 77 -179 121 q -103 44 -220 44 q -117 0 -219 -44 q -103 -44 -179 -121 q -77 -76 -121 -179 q -44 -102 -44 -219 q 0 -117 44 -220 q 44 -102 121 -179 q 76 -76 179 -120 q 102 -44 219 -44 m -461 563 q 0 95 37 179 q 36 84 99 146 q 62 63 146 99 q 84 37 179 37 q 81 0 154 -28 q 72 -27 132 -75 l -645 -644 q -48 60 -75 132 q -27 72 -27 154 m 819 286 q 48 -60 76 -133 q 27 -72 27 -153 q 0 -95 -36 -179 q -37 -84 -99 -147 q -63 -62 -147 -99 q -84 -36 -179 -36 q -82 0 -154 27 q -72 27 -132 75 z"
                    />
                  </svg>
                </FluentIcon>
                Viewing
              {:else if trackChanges}
                <FluentIcon mode="ribbonButtonIconLeft">
                  <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
                    <path
                      type="path"
                      class="OfficeIconColors_HighContrast"
                      d="M 717 1434 q -106 0 -199 40 q -93 40 -162 109 q -70 70 -110 163 q -41 94 -41 200 h -103 q 0 -99 30 -189 q 29 -90 82 -165 q 53 -75 127 -132 q 73 -56 160 -89 q -44 -27 -79 -64 q -36 -37 -61 -82 q -26 -44 -40 -95 q -14 -51 -14 -106 q 0 -85 32 -160 q 32 -74 88 -130 q 55 -55 130 -88 q 75 -32 160 -32 q 85 0 160 32 q 74 33 130 88 q 55 56 87 130 q 32 75 32 160 q 0 55 -14 106 q -14 51 -39 95 q -26 45 -61 82 q -36 37 -80 64 q 87 33 161 89 q 73 57 126 132 q 53 75 83 165 q 29 90 29 189 h -102 q 0 -106 -40 -200 q -41 -93 -110 -163 q -70 -69 -163 -109 q -93 -40 -199 -40 m -307 -410 q 0 63 24 119 q 24 56 66 98 q 41 42 97 66 q 56 24 120 24 q 63 0 119 -24 q 56 -24 98 -66 q 42 -42 66 -98 q 24 -56 24 -119 q 0 -63 -24 -119 q -24 -56 -66 -98 q -42 -42 -98 -66 q -56 -24 -119 -24 q -64 0 -120 24 q -56 24 -97 66 q -42 42 -66 98 q -24 56 -24 119 m 1536 -922 v 922 h -205 l -410 307 v -307 h -102 q 0 -50 -11 -102 h 216 v 204 l 273 -204 h 136 v -717 h -1126 v 307 q -26 0 -51 2 q -26 3 -52 8 v -420 z"
                    />
                    <path
                      type="path"
                      class="OfficeIconColors_m20"
                      d="M 1894 154 v 819 h -170 l -342 256 v -256 h -153 q -10 -97 -54 -181 q -44 -84 -112 -146 q -69 -62 -158 -98 q -89 -36 -188 -36 q -9 0 -17 -1 q -9 0 -17 0 q -5 0 -8 0 q -4 0 -9 1 v -358 m 409 870 q 0 74 -28 138 q -28 65 -77 112 q -49 48 -114 75 q -65 27 -139 27 q -74 0 -139 -27 q -66 -27 -115 -75 q -49 -47 -77 -112 q -28 -64 -28 -138 q 0 -74 28 -140 q 28 -65 77 -114 q 49 -48 115 -76 q 65 -28 139 -28 q 74 0 139 28 q 65 28 114 76 q 49 49 77 114 q 28 66 28 140 m -358 365 q 116 0 219 43 q 102 44 179 119 q 76 75 121 176 q 44 102 44 219 h -1126 q 0 -78 20 -150 q 20 -71 57 -133 q 36 -62 88 -113 q 51 -50 114 -86 q 62 -36 134 -56 q 72 -19 150 -19 z"
                    />
                    <path
                      type="path"
                      style="fill: currentColor;"
                      d="M 717 1434 q -106 0 -199 40 q -93 40 -162 109 q -70 70 -110 163 q -41 94 -41 200 h -103 q 0 -99 30 -189 q 29 -90 82 -165 q 53 -75 127 -132 q 73 -56 160 -89 q -44 -27 -79 -64 q -36 -37 -61 -82 q -26 -44 -40 -95 q -14 -51 -14 -106 q 0 -85 32 -160 q 32 -74 88 -130 q 55 -55 130 -88 q 75 -32 160 -32 q 85 0 160 32 q 74 33 130 88 q 55 56 87 130 q 32 75 32 160 q 0 55 -14 106 q -14 51 -39 95 q -26 45 -61 82 q -36 37 -80 64 q 87 33 161 89 q 73 57 126 132 q 53 75 83 165 q 29 90 29 189 h -102 q 0 -106 -40 -200 q -41 -93 -110 -163 q -70 -69 -163 -109 q -93 -40 -199 -40 m -307 -410 q 0 63 24 119 q 24 56 66 98 q 41 42 97 66 q 56 24 120 24 q 63 0 119 -24 q 56 -24 98 -66 q 42 -42 66 -98 q 24 -56 24 -119 q 0 -63 -24 -119 q -24 -56 -66 -98 q -42 -42 -98 -66 q -56 -24 -119 -24 q -64 0 -120 24 q -56 24 -97 66 q -42 42 -66 98 q -24 56 -24 119 m 1536 -922 v 922 h -205 l -410 307 v -307 h -102 q 0 -50 -11 -102 h 216 v 204 l 273 -204 h 136 v -717 h -1126 v 307 q -26 0 -51 2 q -26 3 -52 8 v -420 z"
                    />
                  </svg>
                </FluentIcon>
                Reviewing
              {:else if $richTextParams.obj.previewMode > 0}
                <FluentIcon mode="ribbonButtonIconLeft">
                  <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
                    <path
                      type="path"
                      class="OfficeIconColors_HighContrast"
                      d="M 820 1462 q 0 3 1 19 q 0 16 1 36 q 1 21 3 42 q 2 21 4 34 l -171 170 l -556 183 l 195 -574 l 1203 -1203 q 38 -38 87 -57 q 49 -19 102 -19 q 56 0 105 21 q 49 22 86 58 q 36 37 57 85 q 21 48 21 102 q 0 52 -20 101 q -20 49 -59 88 l -282 281 q -14 -2 -35 -4 q -22 -2 -43 -3 q -21 -1 -37 -2 q -17 0 -20 0 l 207 -206 l -235 -235 l -995 996 q 85 26 147 87 q 61 62 87 147 m 833 -1302 l 235 235 l 66 -66 q 24 -24 37 -55 q 12 -30 12 -62 q 0 -33 -13 -63 q -13 -30 -35 -53 q -23 -22 -53 -36 q -31 -13 -66 -13 q -32 0 -63 12 q -31 12 -54 35 m -987 1440 q -6 -43 -24 -80 q -19 -37 -48 -66 q -29 -29 -66 -48 q -37 -18 -80 -24 l -127 345 m 1245 -886 q 117 0 220 44 q 102 44 179 120 q 76 77 120 179 q 44 103 44 220 q 0 117 -44 219 q -44 103 -120 179 q -77 77 -179 121 q -103 44 -220 44 q -117 0 -219 -44 q -103 -44 -179 -121 q -77 -76 -121 -179 q -44 -102 -44 -219 q 0 -117 44 -220 q 44 -102 121 -179 q 76 -76 179 -120 q 102 -44 219 -44 m -461 563 q 0 95 37 179 q 36 84 99 146 q 62 63 146 99 q 84 37 179 37 q 81 0 154 -28 q 72 -27 132 -75 l -645 -644 q -48 60 -75 132 q -27 72 -27 154 m 819 286 q 48 -60 76 -133 q 27 -72 27 -153 q 0 -95 -36 -179 q -37 -84 -99 -147 q -63 -62 -147 -99 q -84 -36 -179 -36 q -82 0 -154 27 q -72 27 -132 75 z"
                    />
                    <path
                      type="path"
                      class="OfficeIconColors_m20"
                      d="M 1485 1997 q -106 0 -199 -41 q -93 -40 -162 -110 q -70 -69 -110 -162 q -41 -93 -41 -199 q 0 -106 41 -199 q 40 -93 110 -163 q 69 -69 162 -110 q 93 -40 199 -40 q 106 0 199 40 q 93 41 163 110 q 69 70 110 163 q 40 93 40 199 q 0 106 -40 199 q -41 93 -110 162 q -70 70 -163 110 q -93 41 -199 41 m -666 -512 q 0 24 3 49 l -182 181 l -486 179 l 179 -486 l 1203 -1203 q 32 -32 72 -48 q 39 -16 81 -16 q 44 0 84 17 q 39 18 69 48 q 30 30 48 69 q 17 40 17 84 q 0 42 -16 81 q -16 40 -48 72 l -309 310 q -26 -3 -49 -3 q -138 0 -259 52 q -121 53 -211 143 q -91 91 -143 212 q -53 121 -53 259 z"
                    />
                    <path
                      type="path"
                      class="OfficeIconColors_m22"
                      d="M 820 1462 q 0 3 1 19 q 0 16 1 36 q 1 21 3 42 q 2 21 4 34 l -171 170 l -556 183 l 195 -574 l 1203 -1203 q 38 -38 86 -57 q 48 -19 99 -19 q 57 0 107 21 q 50 21 87 57 q 36 36 58 84 q 21 49 21 104 q 0 52 -20 101 q -20 49 -59 88 l -282 281 q -14 -2 -35 -4 q -22 -2 -43 -3 q -21 -1 -37 -2 q -17 0 -20 0 l 207 -206 l -235 -235 l -995 996 q 85 26 147 87 q 61 62 87 147 m 833 -1302 l 235 235 l 66 -66 q 24 -24 37 -55 q 12 -30 12 -62 q 0 -33 -13 -63 q -13 -30 -35 -53 q -23 -22 -53 -36 q -31 -13 -66 -13 q -32 0 -63 12 q -31 12 -54 35 m -987 1440 q -6 -43 -24 -80 q -19 -37 -48 -66 q -29 -29 -66 -48 q -37 -18 -80 -24 l -127 345 z"
                    />
                    <path
                      type="path"
                      class="OfficeIconColors_m213"
                      d="M 1485 922 q 117 0 220 44 q 102 44 179 120 q 76 77 120 179 q 44 103 44 220 q 0 117 -44 219 q -44 103 -120 179 q -77 77 -179 121 q -103 44 -220 44 q -117 0 -219 -44 q -103 -44 -179 -121 q -77 -76 -121 -179 q -44 -102 -44 -219 q 0 -117 44 -220 q 44 -102 121 -179 q 76 -76 179 -120 q 102 -44 219 -44 m -461 563 q 0 95 37 179 q 36 84 99 146 q 62 63 146 99 q 84 37 179 37 q 81 0 154 -28 q 72 -27 132 -75 l -645 -644 q -48 60 -75 132 q -27 72 -27 154 m 819 286 q 48 -60 76 -133 q 27 -72 27 -153 q 0 -95 -36 -179 q -37 -84 -99 -147 q -63 -62 -147 -99 q -84 -36 -179 -36 q -82 0 -154 27 q -72 27 -132 75 z"
                    />
                  </svg>
                </FluentIcon>
                Viewing
              {:else}
                <FluentIcon mode="ribbonButtonIconLeft">
                  <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
                    <path
                      type="path"
                      class="OfficeIconColors_HighContrast"
                      d="M 1879 169 q 39 39 59 88 q 20 50 20 102 q 0 51 -20 100 q -20 50 -59 89 l -1221 1215 l -556 183 l 195 -574 l 1203 -1203 q 38 -38 86 -57 q 48 -19 99 -19 h 4 q 53 0 103 19 q 49 19 87 57 m -1440 1206 q 85 26 147 87 q 61 62 87 147 l 995 -995 l -234 -234 m -1194 1428 l 345 -127 q -6 -43 -24 -80 q -19 -37 -48 -66 q -29 -29 -66 -48 q -37 -18 -80 -24 m 1440 -987 q 24 -24 37 -55 q 12 -30 12 -62 q 0 -33 -13 -63 q -13 -30 -35 -53 q -23 -22 -53 -36 q -31 -13 -66 -13 q -32 0 -63 12 q -31 12 -54 35 l -66 66 l 235 235 z"
                    />
                    <path
                      type="path"
                      class="OfficeIconColors_m20"
                      d="M 1843 205 q 32 32 48 72 q 16 40 16 82 q 0 42 -16 81 q -16 40 -48 72 l -1203 1203 l -486 179 l 179 -486 l 1203 -1203 q 32 -32 72 -48 q 39 -16 81 -16 q 42 0 82 16 q 40 16 72 48 z"
                    />
                    <path
                      type="path"
                      class="OfficeIconColors_m22"
                      d="M 1879 169 q 39 39 59 88 q 20 50 20 102 q 0 51 -20 100 q -20 50 -59 89 l -1221 1215 l -556 183 l 195 -574 l 1203 -1203 q 38 -38 86 -57 q 48 -19 99 -19 h 4 q 53 0 103 19 q 49 19 87 57 m -1440 1206 q 85 26 147 87 q 61 62 87 147 l 995 -995 l -234 -234 m -1194 1428 l 345 -127 q -6 -43 -24 -80 q -19 -37 -48 -66 q -29 -29 -66 -48 q -37 -18 -80 -24 m 1440 -987 q 24 -24 37 -55 q 12 -30 12 -62 q 0 -33 -13 -63 q -13 -30 -35 -53 q -23 -22 -53 -36 q -31 -13 -66 -13 q -32 0 -63 12 q -31 12 -54 35 l -66 66 l 235 235 z"
                    />
                  </svg>
                </FluentIcon>
                Editing
              {/if}
              <FluentIcon name="ChevronDown20Regular" mode="ribbonButtonIconRight" />
            </Button>
            <MenuFlyout alignment="end" placement="bottom" offset={-2} bind:open={modeMenuOpen}>
              <svelte:fragment slot="flyout">
                <MenuFlyoutItem
                  style="height: 44px;"
                  {disabled}
                  on:click={() => {
                    toggleTrackChanges(false);
                    $richTextParams.set('comments', 0);
                    $richTextParams.set('previewMode', 0);
                  }}
                >
                  <FluentIcon>
                    <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
                      <path
                        type="path"
                        class="OfficeIconColors_HighContrast"
                        d="M 1879 169 q 39 39 59 88 q 20 50 20 102 q 0 51 -20 100 q -20 50 -59 89 l -1221 1215 l -556 183 l 195 -574 l 1203 -1203 q 38 -38 86 -57 q 48 -19 99 -19 h 4 q 53 0 103 19 q 49 19 87 57 m -1440 1206 q 85 26 147 87 q 61 62 87 147 l 995 -995 l -234 -234 m -1194 1428 l 345 -127 q -6 -43 -24 -80 q -19 -37 -48 -66 q -29 -29 -66 -48 q -37 -18 -80 -24 m 1440 -987 q 24 -24 37 -55 q 12 -30 12 -62 q 0 -33 -13 -63 q -13 -30 -35 -53 q -23 -22 -53 -36 q -31 -13 -66 -13 q -32 0 -63 12 q -31 12 -54 35 l -66 66 l 235 235 z"
                      />
                      <path
                        type="path"
                        class="OfficeIconColors_m20"
                        d="M 1843 205 q 32 32 48 72 q 16 40 16 82 q 0 42 -16 81 q -16 40 -48 72 l -1203 1203 l -486 179 l 179 -486 l 1203 -1203 q 32 -32 72 -48 q 39 -16 81 -16 q 42 0 82 16 q 40 16 72 48 z"
                      />
                      <path
                        type="path"
                        class="OfficeIconColors_m22"
                        d="M 1879 169 q 39 39 59 88 q 20 50 20 102 q 0 51 -20 100 q -20 50 -59 89 l -1221 1215 l -556 183 l 195 -574 l 1203 -1203 q 38 -38 86 -57 q 48 -19 99 -19 h 4 q 53 0 103 19 q 49 19 87 57 m -1440 1206 q 85 26 147 87 q 61 62 87 147 l 995 -995 l -234 -234 m -1194 1428 l 345 -127 q -6 -43 -24 -80 q -19 -37 -48 -66 q -29 -29 -66 -48 q -37 -18 -80 -24 m 1440 -987 q 24 -24 37 -55 q 12 -30 12 -62 q 0 -33 -13 -63 q -13 -30 -35 -53 q -23 -22 -53 -36 q -31 -13 -66 -13 q -32 0 -63 12 q -31 12 -54 35 l -66 66 l 235 235 z"
                      />
                    </svg>
                  </FluentIcon>
                  <div>
                    <div>Editing</div>
                    <div style="font-size: 12px; line-height: 16px;">Make any changes</div>
                  </div>
                </MenuFlyoutItem>
                <MenuFlyoutItem
                  style="height: 44px;"
                  disabled={disabled || !options?.features.trackChanges}
                  on:click={() => {
                    toggleTrackChanges(true);
                    $richTextParams.set('comments', 1);
                    $richTextParams.set('previewMode', 0);
                  }}
                >
                  <FluentIcon>
                    <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
                      <path
                        type="path"
                        class="OfficeIconColors_HighContrast"
                        d="M 717 1434 q -106 0 -199 40 q -93 40 -162 109 q -70 70 -110 163 q -41 94 -41 200 h -103 q 0 -99 30 -189 q 29 -90 82 -165 q 53 -75 127 -132 q 73 -56 160 -89 q -44 -27 -79 -64 q -36 -37 -61 -82 q -26 -44 -40 -95 q -14 -51 -14 -106 q 0 -85 32 -160 q 32 -74 88 -130 q 55 -55 130 -88 q 75 -32 160 -32 q 85 0 160 32 q 74 33 130 88 q 55 56 87 130 q 32 75 32 160 q 0 55 -14 106 q -14 51 -39 95 q -26 45 -61 82 q -36 37 -80 64 q 87 33 161 89 q 73 57 126 132 q 53 75 83 165 q 29 90 29 189 h -102 q 0 -106 -40 -200 q -41 -93 -110 -163 q -70 -69 -163 -109 q -93 -40 -199 -40 m -307 -410 q 0 63 24 119 q 24 56 66 98 q 41 42 97 66 q 56 24 120 24 q 63 0 119 -24 q 56 -24 98 -66 q 42 -42 66 -98 q 24 -56 24 -119 q 0 -63 -24 -119 q -24 -56 -66 -98 q -42 -42 -98 -66 q -56 -24 -119 -24 q -64 0 -120 24 q -56 24 -97 66 q -42 42 -66 98 q -24 56 -24 119 m 1536 -922 v 922 h -205 l -410 307 v -307 h -102 q 0 -50 -11 -102 h 216 v 204 l 273 -204 h 136 v -717 h -1126 v 307 q -26 0 -51 2 q -26 3 -52 8 v -420 z"
                      />
                      <path
                        type="path"
                        class="OfficeIconColors_m20"
                        d="M 1894 154 v 819 h -170 l -342 256 v -256 h -153 q -10 -97 -54 -181 q -44 -84 -112 -146 q -69 -62 -158 -98 q -89 -36 -188 -36 q -9 0 -17 -1 q -9 0 -17 0 q -5 0 -8 0 q -4 0 -9 1 v -358 m 409 870 q 0 74 -28 138 q -28 65 -77 112 q -49 48 -114 75 q -65 27 -139 27 q -74 0 -139 -27 q -66 -27 -115 -75 q -49 -47 -77 -112 q -28 -64 -28 -138 q 0 -74 28 -140 q 28 -65 77 -114 q 49 -48 115 -76 q 65 -28 139 -28 q 74 0 139 28 q 65 28 114 76 q 49 49 77 114 q 28 66 28 140 m -358 365 q 116 0 219 43 q 102 44 179 119 q 76 75 121 176 q 44 102 44 219 h -1126 q 0 -78 20 -150 q 20 -71 57 -133 q 36 -62 88 -113 q 51 -50 114 -86 q 62 -36 134 -56 q 72 -19 150 -19 z"
                      />
                      <path
                        type="path"
                        class="OfficeIconColors_m22"
                        d="M 717 1434 q -106 0 -199 40 q -93 40 -162 109 q -70 70 -110 163 q -41 94 -41 200 h -103 q 0 -99 30 -189 q 29 -90 82 -165 q 53 -75 127 -132 q 73 -56 160 -89 q -44 -27 -79 -64 q -36 -37 -61 -82 q -26 -44 -40 -95 q -14 -51 -14 -106 q 0 -85 32 -160 q 32 -74 88 -130 q 55 -55 130 -88 q 75 -32 160 -32 q 85 0 160 32 q 74 33 130 88 q 55 56 87 130 q 32 75 32 160 q 0 55 -14 106 q -14 51 -39 95 q -26 45 -61 82 q -36 37 -80 64 q 87 33 161 89 q 73 57 126 132 q 53 75 83 165 q 29 90 29 189 h -102 q 0 -106 -40 -200 q -41 -93 -110 -163 q -70 -69 -163 -109 q -93 -40 -199 -40 m -307 -410 q 0 63 24 119 q 24 56 66 98 q 41 42 97 66 q 56 24 120 24 q 63 0 119 -24 q 56 -24 98 -66 q 42 -42 66 -98 q 24 -56 24 -119 q 0 -63 -24 -119 q -24 -56 -66 -98 q -42 -42 -98 -66 q -56 -24 -119 -24 q -64 0 -120 24 q -56 24 -97 66 q -42 42 -66 98 q -24 56 -24 119 m 1536 -922 v 922 h -205 l -410 307 v -307 h -102 q 0 -50 -11 -102 h 216 v 204 l 273 -204 h 136 v -717 h -1126 v 307 q -26 0 -51 2 q -26 3 -52 8 v -420 z"
                      />
                    </svg>
                  </FluentIcon>
                  <div>
                    <div>Reviewing</div>
                    <div style="font-size: 12px; line-height: 16px;">
                      Add comments and suggest changes
                    </div>
                  </div>
                </MenuFlyoutItem>
                <MenuFlyoutItem
                  style="height: 44px;"
                  {disabled}
                  on:click={() => {
                    toggleTrackChanges(false);
                    $richTextParams.set('comments', 0);
                    $richTextParams.set('previewMode', 2);
                  }}
                >
                  <FluentIcon>
                    <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
                      <path
                        type="path"
                        class="OfficeIconColors_HighContrast"
                        d="M 820 1462 q 0 3 1 19 q 0 16 1 36 q 1 21 3 42 q 2 21 4 34 l -171 170 l -556 183 l 195 -574 l 1203 -1203 q 38 -38 87 -57 q 49 -19 102 -19 q 56 0 105 21 q 49 22 86 58 q 36 37 57 85 q 21 48 21 102 q 0 52 -20 101 q -20 49 -59 88 l -282 281 q -14 -2 -35 -4 q -22 -2 -43 -3 q -21 -1 -37 -2 q -17 0 -20 0 l 207 -206 l -235 -235 l -995 996 q 85 26 147 87 q 61 62 87 147 m 833 -1302 l 235 235 l 66 -66 q 24 -24 37 -55 q 12 -30 12 -62 q 0 -33 -13 -63 q -13 -30 -35 -53 q -23 -22 -53 -36 q -31 -13 -66 -13 q -32 0 -63 12 q -31 12 -54 35 m -987 1440 q -6 -43 -24 -80 q -19 -37 -48 -66 q -29 -29 -66 -48 q -37 -18 -80 -24 l -127 345 m 1245 -886 q 117 0 220 44 q 102 44 179 120 q 76 77 120 179 q 44 103 44 220 q 0 117 -44 219 q -44 103 -120 179 q -77 77 -179 121 q -103 44 -220 44 q -117 0 -219 -44 q -103 -44 -179 -121 q -77 -76 -121 -179 q -44 -102 -44 -219 q 0 -117 44 -220 q 44 -102 121 -179 q 76 -76 179 -120 q 102 -44 219 -44 m -461 563 q 0 95 37 179 q 36 84 99 146 q 62 63 146 99 q 84 37 179 37 q 81 0 154 -28 q 72 -27 132 -75 l -645 -644 q -48 60 -75 132 q -27 72 -27 154 m 819 286 q 48 -60 76 -133 q 27 -72 27 -153 q 0 -95 -36 -179 q -37 -84 -99 -147 q -63 -62 -147 -99 q -84 -36 -179 -36 q -82 0 -154 27 q -72 27 -132 75 z"
                      />
                      <path
                        type="path"
                        class="OfficeIconColors_m20"
                        d="M 1485 1997 q -106 0 -199 -41 q -93 -40 -162 -110 q -70 -69 -110 -162 q -41 -93 -41 -199 q 0 -106 41 -199 q 40 -93 110 -163 q 69 -69 162 -110 q 93 -40 199 -40 q 106 0 199 40 q 93 41 163 110 q 69 70 110 163 q 40 93 40 199 q 0 106 -40 199 q -41 93 -110 162 q -70 70 -163 110 q -93 41 -199 41 m -666 -512 q 0 24 3 49 l -182 181 l -486 179 l 179 -486 l 1203 -1203 q 32 -32 72 -48 q 39 -16 81 -16 q 44 0 84 17 q 39 18 69 48 q 30 30 48 69 q 17 40 17 84 q 0 42 -16 81 q -16 40 -48 72 l -309 310 q -26 -3 -49 -3 q -138 0 -259 52 q -121 53 -211 143 q -91 91 -143 212 q -53 121 -53 259 z"
                      />
                      <path
                        type="path"
                        class="OfficeIconColors_m22"
                        d="M 820 1462 q 0 3 1 19 q 0 16 1 36 q 1 21 3 42 q 2 21 4 34 l -171 170 l -556 183 l 195 -574 l 1203 -1203 q 38 -38 86 -57 q 48 -19 99 -19 q 57 0 107 21 q 50 21 87 57 q 36 36 58 84 q 21 49 21 104 q 0 52 -20 101 q -20 49 -59 88 l -282 281 q -14 -2 -35 -4 q -22 -2 -43 -3 q -21 -1 -37 -2 q -17 0 -20 0 l 207 -206 l -235 -235 l -995 996 q 85 26 147 87 q 61 62 87 147 m 833 -1302 l 235 235 l 66 -66 q 24 -24 37 -55 q 12 -30 12 -62 q 0 -33 -13 -63 q -13 -30 -35 -53 q -23 -22 -53 -36 q -31 -13 -66 -13 q -32 0 -63 12 q -31 12 -54 35 m -987 1440 q -6 -43 -24 -80 q -19 -37 -48 -66 q -29 -29 -66 -48 q -37 -18 -80 -24 l -127 345 z"
                      />
                      <path
                        type="path"
                        class="OfficeIconColors_m213"
                        d="M 1485 922 q 117 0 220 44 q 102 44 179 120 q 76 77 120 179 q 44 103 44 220 q 0 117 -44 219 q -44 103 -120 179 q -77 77 -179 121 q -103 44 -220 44 q -117 0 -219 -44 q -103 -44 -179 -121 q -77 -76 -121 -179 q -44 -102 -44 -219 q 0 -117 44 -220 q 44 -102 121 -179 q 76 -76 179 -120 q 102 -44 219 -44 m -461 563 q 0 95 37 179 q 36 84 99 146 q 62 63 146 99 q 84 37 179 37 q 81 0 154 -28 q 72 -27 132 -75 l -645 -644 q -48 60 -75 132 q -27 72 -27 154 m 819 286 q 48 -60 76 -133 q 27 -72 27 -153 q 0 -95 -36 -179 q -37 -84 -99 -147 q -63 -62 -147 -99 q -84 -36 -179 -36 q -82 0 -154 27 q -72 27 -132 75 z"
                      />
                    </svg>
                  </FluentIcon>
                  <div>
                    <div>Viewing</div>
                    <div style="font-size: 12px; line-height: 16px;">
                      View the document in preview mode
                    </div>
                  </div>
                </MenuFlyoutItem>
              </svelte:fragment>
            </MenuFlyout>
          </div>
        {/if}

        <!-- restore/maximize -->
        {#if $richTextParams.isActive('fs') && $richTextParams.obj.fs !== 3}
          <IconButton
            on:click={() => {
              $richTextParams.set('fs', 0);
            }}
          >
            <FluentIcon name="ArrowMinimize20Regular" />
          </IconButton>
        {:else if $richTextParams.obj.fs !== 3}
          <IconButton
            on:click={() => {
              $richTextParams.set('fs', 1);
            }}
          >
            <FluentIcon name="ArrowMaximize20Regular" />
          </IconButton>
        {/if}
      </div>
    </div>
  </div>
  {#if width > 400}
    <div class="tabpanel">
      <HomeTabPanel visible={activeTab === 'home'} {editor} {options} {disabled} />
      <InsertTabPanel visible={activeTab === 'insert'} {editor} {options} {user} {disabled} />
      <LayoutTabPanel visible={activeTab === 'layout'} {editor} {options} {disabled} />
      <ReviewTabPanel
        visible={activeTab === 'review'}
        {editor}
        {options}
        {user}
        {trackChanges}
        {toggleTrackChanges}
        bind:docStatsDialogOpen
        {disabled}
      />
      <ViewTabPanel visible={activeTab === 'view'} {editor} {options} {disabled} />
      {#if options?.features.tables}
        <TableTabPanel visible={activeTab === 'table'} {editor} {options} {setTab} {disabled} />
      {/if}
      {#if options?.features.widgets?.youtube}
        <YoutubeTabPanel visible={activeTab === 'youtube'} {editor} {setTab} {disabled} />
      {/if}
      {#if options?.features.widgets?.photoWidget}
        <PhotoTabPanel visible={activeTab === 'photo'} {editor} {setTab} {disabled} />
      {/if}
      {#if options?.features.pullQuote}
        <PullQuoteTabPanel visible={activeTab === 'pullQuote'} {editor} {setTab} {disabled} />
      {/if}
    </div>
  {/if}
</div>

<style>
  .ribbon {
    width: 100%;
    background-color: var(--titlebar-bg);
    user-select: none;
  }

  .top {
    display: flex;
    justify-content: space-between;
    white-space: nowrap;
    height: 36px;
    position: relative;
    margin-top: 4px;
    -webkit-app-region: drag;
    app-region: drag;
    user-select: none;
  }

  .tabpanel {
    height: 40px;
    background-color: var(--fds-solid-background-quarternary);
    color: var(--fds-text-primary);
    border-bottom: none;
    border-radius: var(--fds-control-corner-radius);
    box-sizing: border-box;
    box-shadow:
      rgba(0, 0, 0, 0.133) 0px 1.6px 3.6px 0px,
      rgba(0, 0, 0, 0.11) 0px 0.3px 0.9px 0px;
    z-index: 2;
    position: relative;
    display: flex;
    justify-content: left;
    /* overflow: hidden; */
    --tabpanelmargin: 8px;
    margin: 0 var(--tabpanelmargin);
    width: calc(100% - (2 * var(--tabpanelmargin)));
  }

  .tabpanel :global(.panel) {
    display: flex;
    justify-content: left;
    align-items: center;
    --margin: 4px;
    margin: var(--margin);
    visibility: visible;
    width: calc(100% - (2 * var(--margin)));
    height: 32px;
    transform: translateX(-20px);
    opacity: 0;
    transition: transform 0.15s ease 0s;
    white-space: nowrap;
    flex-wrap: nowrap;
    align-content: flex-start;
    gap: 4px;
    position: absolute;
    left: 0;
    box-sizing: border-box;
  }

  .tabpanel :global(.panel.visible) {
    visibility: visible;
    transform: none;
    opacity: 100;
    z-index: 1;
    transition:
      transform 0.15s ease 0s,
      opacity 0.15s ease 0s;
  }

  .tabpanel :global(.panel > .button),
  .tabpanel :global(.panel > .tooltip-wrapper > .button) {
    height: 32px;
    background-color: transparent !important;
    box-shadow: none;
  }

  .tabpanel :global(.panel > .icon-button),
  .tabpanel :global(.panel > .tooltip-wrapper > .icon-button) {
    width: 32px;
    height: 32px;
  }

  .tabpanel :global(.panel > span.bar) {
    display: inline-flex;
    height: 24px;
    align-items: center;
    margin: 4px 4px;
    width: 1px;
    background-color: var(--fds-control-strong-fill-disabled);
    opacity: 0.6;
  }
  @media (resolution: 144dpi) {
    .tabpanel :global(.panel > span.bar) {
      width: 0.67px;
    }
  }

  .tabpanel,
  .focuszone {
    --mouse-hover: #e1dfdd;
    --mouse-active: #c8c6c4;
    --tool-active: #d2d0ce;
    --tool-active-hover: #979593;
  }
  @media (prefers-color-scheme: dark) {
    .tabpanel,
    .focuszone {
      --mouse-hover: #484644;
      --mouse-active: #797775;
      --tool-active: #605e5c;
      --tool-active-hover: #8a8886;
    }
  }

  .focuszone :global(.button.active:not(.style-accent)),
  .tabpanel :global(.panel > .button.active),
  .tabpanel :global(.panel > .icon-button.active),
  .tabpanel :global(.panel > .tooltip-wrapper > .button.active),
  .tabpanel :global(.panel > .tooltip-wrapper > .icon-button.active) {
    background-color: var(--tool-active) !important;
    background-color: var(--mouse-hover) !important;
  }

  .focuszone :global(.button.active:not(.style-accent)):hover:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .button.active):hover:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .icon-button.active):hover:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .tooltip-wrapper > .button.active):hover:not(disabled):not(.disabled),
  .tabpanel
    :global(.panel > .tooltip-wrapper > .icon-button.active):hover:not(disabled):not(.disabled) {
    box-shadow: inset 0 0 0 1px var(--tool-active-hover);
  }

  .focuszone :global(.button:not(.style-accent)):hover:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .button):hover:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .icon-button):hover:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .tooltip-wrapper > .button):hover:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .tooltip-wrapper > .icon-button):hover:not(disabled):not(.disabled) {
    background-color: var(--mouse-hover) !important;
  }

  .focuszone :global(.button:not(.style-accent)):active:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .button):active:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .icon-button):active:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .tooltip-wrapper > .button):active:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .tooltip-wrapper > .icon-button):active:not(disabled):not(.disabled) {
    background-color: var(--mouse-active) !important;
  }

  .tabpanel :global(.panel > .tooltip-wrapper > .button.style-standard),
  .tabpanel :global(.panel > .button.style-standard) {
    padding-left: 6px;
    padding-right: 6px;
  }

  .tabpanel :global(.panel > .tooltip-wrapper > .icon-button),
  .tabpanel :global(.panel > .icon-button) {
    padding: 6px;
  }
  .tabpanel :global(.panel > .tooltip-wrapper > .icon-button svg),
  .tabpanel :global(.panel > .icon-button svg) {
    inline-size: 18px;
  }

  .tabpanel :global(.panel > .tooltip-wrapper > .button.disabled svg),
  .tabpanel :global(.panel > .tooltip-wrapper > .icon-button.disabled svg),
  .tabpanel :global(.panel > .button.disabled svg),
  .tabpanel :global(.panel > .icon-button.disabled svg) {
    fill: #3a3a38ff;
    opacity: 0.4;
  }
  @media (prefers-color-scheme: dark) {
    .tabpanel :global(.panel > .tooltip-wrapper > .button.disabled svg),
    .tabpanel :global(.panel > .tooltip-wrapper > .icon-button.disabled svg),
    .tabpanel :global(.panel > .button.disabled svg),
    .tabpanel :global(.panel > .icon-button.disabled svg) {
      fill: #d4d4d4ff;
    }
  }

  .tabpanel :global(.panel > .menu-flyout-wrapper) {
    margin-right: -4px;
    height: 32px;
  }

  .tabs {
    position: relative;
    display: flex;
    flex-direction: row;
    height: 30px;
    -webkit-app-region: no-drag;
    app-region: no-drag;
  }

  .tabs :global(.button.style-standard) {
    background-color: transparent;
    box-shadow: none;
    padding-left: 11px;
    padding-right: 11px;
  }

  .tabs :global(.button.style-standard):hover:not(disabled):not(.disabled) {
    background-color: var(--fds-subtle-fill-secondary);
  }

  .tabs :global(.button.style-standard):active:not(disabled):not(.disabled) {
    background-color: var(--fds-subtle-fill-tertiary);
    color: var(--fds-text-secondary);
  }

  .tabs :global(.button.style-standard[data-contextual='true']) {
    color: var(--fds-accent-default);
  }

  .tabline {
    margin: 0px;
    bottom: 0px;
    left: 111.573px;
    width: 41.3646px;
    height: 2.4px;
    pointer-events: none;
    position: absolute;
    transition: all 150ms cubic-bezier(0.17, 0.17, 0, 1) 0s;
    float: left;
    background-color: var(--fds-accent-default);
    border-radius: 6px;
  }

  .focuszone {
    -webkit-app-region: no-drag;
    app-region: no-drag;
    display: flex;
    flex-direction: row;
    gap: 5px;
    align-items: center;
    height: 32px;
    color: var(--fds-text-primary);
  }

  .au {
    display: flex;
    flex-direction: row;
  }

  :global(.awareness-user) {
    padding: 0 !important;
  }

  .focuszone :global(.tooltip-wrapper) {
    height: 32px;
    width: 32px;
  }

  .focuszone :global(.button) {
    height: 24px;
    margin-bottom: 2px;
    font-size: var(--fds-caption-font-size);
    padding-left: 8px;
    padding-right: 8px;
  }
  .focuszone :global(.button-icon.ribbon-icon) {
    margin-right: 4px !important;
  }
  .focuszone :global(.button-icon:nth-of-type(2)) {
    margin-left: 2px !important;
  }
  .focuszone :global(.button svg) {
    width: 16px;
    height: 16px;
  }

  .focuszone :global(.icon-button) {
    height: 32px;
    width: 32px;
  }

  :global(.ribbon-person-picture) {
    border: none !important;
    box-shadow: 0 0 0 2.4px currentColor;
    -webkit-user-drag: none;
  }
</style>
