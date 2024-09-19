<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { title } from '$stores/title';
  import { genAvatar } from '$utils';
  import { Flyout, IconButton, PersonPicture, TextBlock } from 'fluent-svelte';
  import { onDestroy, onMount } from 'svelte';
  import type { LayoutData } from '../../routes/(admin)/admin/$types';
  import ProfileFlyout from './ProfileFlyout.svelte';

  export let data: LayoutData;

  const isMacLike = (() => {
    if (!browser) return false;
    if (!navigator) return false;
    //@ts-expect-error userAgentData is only available in some browsers
    return navigator.userAgentData
      ? //@ts-expect-error userAgentData is only available in some browsers
        /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgentData.platform)
      : /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
  })();

  let flyoutOpen: boolean = false;
  let browserFocused: boolean = browser && window.document.hasFocus();

  function handleFocus() {
    browserFocused = true;
  }

  function handleBlur() {
    browserFocused = false;
  }

  onMount(() => {
    if (browser) {
      window.addEventListener('focus', handleFocus);
      window.addEventListener('blur', handleBlur);
    }
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    }
  });

  // right controls: <- -> | title     […] [_] [■] [X]
  // left controls:  [X] [_] [■] | <- -> | title     […]
</script>

<div class="titlebar" class:browserFocused data-tauri-drag-region>
  <div class="left">
    {#if !isMacLike}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="41.57"
        height="26"
        viewBox="0 0 31.1775 36"
        class:noMargin={false}
      >
        <path
          d="m28.1553 10.7445-8.1515-4.7059v12.7647l8.1515-4.7059zM7.4376 8.1969l11.0557 6.3824V5.1667l-2.9039-1.676ZM12.683 30.8327l2.9064 1.677 8.081-4.665-10.9852-6.3409zM25.182 26.9724l2.9736-1.7166v-9.4132l-11.1275 6.424zM5.9264 9.0687l-2.903 1.6758-.0006 9.412 11.0544-6.3825zM3.0229 25.2555l8.1495 4.704.0028-12.764-8.1521 4.706z"
        />
        <path
          d="M15.589 0 .0006 8.9998 0 27.0002 15.5886 36l15.5885-8.9998V8.9998zm14.0775 26.1277L15.5897 34.255l-14.078-8.1273.0005-16.2554L15.5896 1.745l14.0767 8.1273z"
        />
      </svg>
    {/if}
    <!-- {#if $titlebarActions.length > 0}
      <div class="divider" />
      {#each $titlebarActions as action}
        <IconButton
          title={action.label}
          on:click={(evt) => action.action(evt)}
          disabled={action.disabled}
          class={action.active ? 'active' : ''}
          style="--inline-size: {action.size || 16}px;"
        >
          {#if action.iconHtml}
            {@html action.iconHtml}
          {:else}
            <FluentIcon name={action.icon} />
          {/if}
        </IconButton>
      {/each}
      <div class="divider" />
    {/if} -->
    <TextBlock variant="caption" data-tauri-drag-region>
      {#if $title}
        {$title} -
      {/if}
      {#if $page.url.hostname === 'troop370atlanta.org'}
        Troop 370 Admin
      {:else}
        Troop 370 Admin (Development)
      {/if}
    </TextBlock>
  </div>
  <div class="right">
    <div class="account" data-tauri-drag-region class:tauri={false}>
      <Flyout
        placement="bottom"
        alignment="end"
        bind:open={flyoutOpen}
        style="
          --fds-flyout-transform: translateY(0%); /* required, but is not added when alignment=end */
          --fds-flyout-transition-offset: translateY(-24px) /* this is twice the default */
        "
      >
        <IconButton style="padding: 0 10px; margin-right: -10px;">
          {#if true}
            <TextBlock variant="caption" style="margin-right: 10px;">
              {data.session.adminUser?.firstname}
              {data.session.adminUser?.lastname}
            </TextBlock>
          {/if}
          <PersonPicture
            size={26}
            src={genAvatar(data.session.adminUser?.id.toString() || '')}
            alt={data.session.adminEmail}
          />
        </IconButton>
        <svelte:fragment slot="flyout">
          <ProfileFlyout {data} bind:flyoutOpen />
        </svelte:fragment>
      </Flyout>
    </div>
  </div>
</div>

<style>
  .titlebar {
    display: flex;
    flex-direction: row;
    align-items: center;
    position: relative;
    left: env(titlebar-area-x, 0);
    top: env(titlebar-area-y, 0);
    width: env(titlebar-area-width, 100%);
    height: env(titlebar-area-height, 33px);
    -webkit-app-region: drag;
    /* app-region: drag; */
    user-select: none;
    justify-content: space-between;
    background-color: var(--titlebar-bg);
    padding: 0 16px;
    box-sizing: border-box;
    color: #888888;
  }

  .titlebar.browserFocused,
  .titlebar.browserFocused .account.tauri :global(.icon-button) {
    color: #000000;
  }
  /* .titlebar.browserFocused .window-controls.windows {
    opacity: 1;
  } */

  @media (prefers-color-scheme: dark) {
    .titlebar.browserFocused,
    .titlebar.browserFocused .account.tauri :global(.icon-button) {
      color: #ffffff;
    }
  }

  .left {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }

  .right {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
  }

  svg {
    width: 16px;
    height: 16px;
    margin: 0 16px 0 0;
    fill: var(--color-primary-800);
  }
  svg.noMargin {
    margin-right: 8px;
  }
  @media (prefers-color-scheme: dark) {
    svg {
      fill: var(--color-primary-300);
    }
  }

  /* mica styles */
  /* .titlebar.mica {
    background-color: transparent;
    padding-right: 0;
  } */

  /* acrylic styles */
  /* .titlebar.acrylic {
    background-color: rgba(255, 255, 255, 0.8);
  }
  @media (prefers-color-scheme: dark) {
    .titlebar.acrylic {
      background-color: rgba(0, 0, 0, 0.4);
    }
  } */

  /* account picker */
  .account {
    -webkit-app-region: no-drag;
    /* app-region: no-drag; */
  }
  .account :global(.flyout) {
    min-inline-size: 300px;
    padding: 0;
  }
  .account :global(.icon-button) {
    padding: 2px;
  }
  .account.tauri :global(.icon-button) {
    padding: 4px 10px 3px;
    border-radius: 0;
    color: #888888;
  }

  /* vertical divider */
  /* div.divider {
    width: 0;
    height: calc(env(titlebar-area-height, 33px) * 0.6);
    border-left: 1px solid rgba(255, 255, 255, 0.4);
    margin: 0 8px;
  } */

  /* action icons */
  div.left :global(.icon-button) {
    --rgb: 0, 0, 0;
    padding: 2px;
    -webkit-app-region: no-drag;
    /* app-region: no-drag; */
  }
  @media (prefers-color-scheme: dark) {
    div.left :global(.icon-button) {
      --rgb: 255, 255, 255;
    }
  }
  div.left :global(.icon-button:hover:not(.disabled)) {
    background-color: rgba(var(--rgb), 0.08);
  }
  div.left :global(.icon-button:active:not(.disabled)) {
    background-color: rgba(var(--rgb), 0.12);
  }
  div.left :global(.icon-button.active) {
    background-color: rgba(var(--rgb), 0.1);
  }

  div.left :global(.icon-button svg) {
    inline-size: var(--inline-size, 16px);
  }

  /* div.left.tauri :global(.icon-button) {
    border-radius: 0;
    block-size: env(titlebar-area-height, 33px);
  } */
</style>
