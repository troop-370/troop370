<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { formatISODate } from '$utils';
  import { Button, MenuFlyout, MenuFlyoutItem, ProgressRing } from 'fluent-svelte';
  import { isString } from 'is-what';
  import type { Readable, Writable } from 'svelte/store';
  import type { PageData } from './$types';

  interface Features {
    actions?: boolean;
    docInfo?: boolean;
  }

  type ValueType<T> = T extends Readable<infer V> ? V : never;

  export let actions: ValueType<PageData['actions']>;
  export let isEmbedded = false;
  export let features: Features = {
    actions: true,
    docInfo: true,
  };

  export let docData: Record<string, unknown>;

  let actionsMenuOpen = false;
  $: saveAction = actions.find((action) => action.id === 'save');
  $: publishAction = actions.find((action) => action.id === 'publish');
  $: restActions = actions.filter(
    (action) => action.id !== saveAction?.id && action.id !== publishAction?.id
  );
</script>

<aside class="wrapper" class:isEmbedded>
  {#if features.actions}
    <div class="button-row" style={!saveAction && !publishAction ? 'justify-content: end;' : ''}>
      {#if saveAction}
        {@const { action, disabled, onAuxClick, tooltip, icon, label, loading } = saveAction}
        <Button
          style="flex: 1;"
          disabled={disabled || loading}
          on:click={disabled ? undefined : action}
          on:auxclick={disabled ? undefined : onAuxClick}
          data-tip={tooltip}
        >
          {#if loading}
            <div class="button-progress"><ProgressRing size={16} /></div>
          {/if}
          {#key loading}
            <FluentIcon
              name={icon}
              mode="buttonIconLeft"
              style={loading ? 'visibility: hidden;' : ''}
            />
            <span style="white-space: nowrap; {loading ? 'visibility: hidden;' : ''}">{label}</span>
          {/key}
        </Button>
      {/if}

      {#if publishAction}
        {@const { action, disabled, onAuxClick, tooltip, icon, label, loading } = publishAction}
        <Button
          style="flex: 1;"
          disabled={disabled || loading}
          on:click={disabled ? undefined : action}
          on:auxclick={disabled ? undefined : onAuxClick}
          data-tip={tooltip}
        >
          {#if loading}
            <div class="button-progress"><ProgressRing size={16} /></div>
          {/if}
          {#key loading}
            <FluentIcon
              name={icon}
              mode="buttonIconLeft"
              style={loading ? 'visibility: hidden;' : ''}
            />
            <span style="white-space: nowrap; {loading ? 'visibility: hidden;' : ''}">{label}</span>
          {/key}
        </Button>
      {/if}
      <div style="display: flex;">
        <Button
          class={!saveAction && !publishAction ? '' : 'solid-icon-button'}
          style="width: 100%; {!saveAction && !publishAction
            ? 'justify-content: space-between;'
            : ''}"
          on:click={() => (actionsMenuOpen = !actionsMenuOpen)}
        >
          {#if !saveAction && !publishAction}
            Actions
            <FluentIcon name="ChevronDown16Regular" mode="buttonIconRight" />
          {:else}
            <FluentIcon name="MoreHorizontal16Regular" mode="buttonIconLeft" />
          {/if}
        </Button>
        <MenuFlyout
          alignment="end"
          placement="bottom"
          offset={0}
          bind:open={actionsMenuOpen}
          closeOnSelect={false}
        >
          <svelte:fragment slot="flyout">
            {#each restActions as { action, disabled, onAuxClick, tooltip, icon, label, id, loading, hint }}
              <MenuFlyoutItem
                disabled={disabled || loading}
                on:click={async (evt) => {
                  await action(evt);
                  setTimeout(() => {
                    actionsMenuOpen = false;
                  }, 1);
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
      </div>
    </div>
  {/if}

  {#if features.docInfo}
    <div class="section-title">Document information</div>
    <div class="doc-info-row">
      <div>ID</div>
      <div>{docData.documentId}</div>
    </div>
    <div class="doc-info-row">
      <div>Created</div>
      <div>
        {#if docData.createdAt && isString(docData.createdAt)}
          {formatISODate(docData.createdAt, undefined, undefined, true)}
        {:else}
          ⋯
        {/if}
      </div>
    </div>
    <div class="doc-info-row">
      <div>Last updated</div>
      <div>
        {#if docData.updatedAt && isString(docData.updatedAt)}
          {formatISODate(docData.updatedAt, undefined, undefined, true)}
        {:else}
          ⋯
        {/if}
      </div>
    </div>
  {/if}
</aside>

<style>
  aside.wrapper {
    --border-color: var(--color-neutral-light-200);
    border-left: 1px solid var(--border-color);
    width: 320px;
    height: 100%;
    overflow: hidden auto;
    padding: 20px;
    box-sizing: border-box;
    flex-grow: 0;
    flex-shrink: 0;
  }
  @media (prefers-color-scheme: dark) {
    aside.wrapper {
      --border-color: var(--color-neutral-dark-200);
    }
  }

  aside.isEmbedded {
    border: none;
    padding: 0;
    width: auto;
    height: auto;
    overflow: unset;
  }

  .button-row {
    display: flex;
    flex-direction: row;
    gap: 6px;
    margin: 20px 0 10px 0;
  }

  .button-row :global(.button:not(:last-of-type)) {
    flex-grow: 1;
  }

  aside :global(.solid-icon-button) {
    padding-inline: 7px;
    height: 30px;
  }
  aside :global(.solid-icon-button .button-icon) {
    margin: 0 !important;
  }

  div.section-title {
    font-family: var(--fds-font-family-text);
    font-size: 12px;
    font-weight: 400;
    text-decoration: none;
    opacity: 0.8;
    line-height: 48px;
    margin: 0px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .section-title.hidden {
    display: none;
  }

  div.doc-info-row {
    font-family: var(--fds-font-family-text);
    font-size: 14px;
    line-height: 24px;
    margin: 0 0 4px 0;
    font-weight: 400;
    text-decoration: none;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }
  div.doc-info-row:nth-of-type(1) {
    opacity: 0.9;
  }
  div.doc-info-row:nth-of-type(2) {
    opacity: 0.8;
  }
</style>
