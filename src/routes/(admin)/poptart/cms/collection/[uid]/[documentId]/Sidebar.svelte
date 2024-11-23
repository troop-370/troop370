<script lang="ts">
  import Chip from '$lib/common/Chip/Chip.svelte';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { capitalize, formatISODate, listOxford, notEmpty, openWindow } from '$utils';
  import { Button, MenuFlyout, MenuFlyoutItem, ProgressRing, TextBlock } from 'fluent-svelte';
  import { isString } from 'is-what';
  import type { Readable } from 'svelte/store';
  import type { PageData } from './$types';

  interface Features {
    actions?: boolean;
    docInfo?: boolean;
    versions?: boolean;
  }

  type ValueType<T> = T extends Readable<infer V> ? V : never;

  export let actions: ValueType<PageData['actions']> | undefined = undefined;
  export let previewConfig: Readable<ValueType<PageData['previewConfig']>> | undefined = undefined;
  export let isEmbedded = false;
  export let versions: PageData['versions'] | undefined = undefined;
  export let features: Features = {
    actions: true,
    docInfo: true,
    versions: true,
  };

  export let docData: Record<string, unknown>;

  let actionsMenuOpen = false;
  $: saveAction = actions?.find((action) => action.id === 'save');
  $: publishAction = actions?.find((action) => action.id === 'publish');
  $: restActions = actions?.filter(
    (action) => action.id !== saveAction?.id && action.id !== publishAction?.id
  );

  let truncateVersionsList = true;
  $: versionsList = [
    docData.status === 'modified'
      ? {
          timestamp: 'Latest published version',
          users: [],
          path: '?status=published&childWindow=1',
          status: 'published',
        }
      : null,
    ...($versions?.data?.data.map((version) => {
      return {
        timestamp: version.createdAt,
        users: [{ name: version.createdBy.firstname + ' ' + version.createdBy.lastname }],
        path: `${docData.documentId}/version/${version.id}?childWindow=1`,
        status: version.status,
      };
    }) || []),
  ].filter(notEmpty);
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
            {#each restActions || [] as { action, disabled, onAuxClick, tooltip, icon, label, id, loading, hint }}
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
    {#if docData.status}
      <div class="doc-info-row">
        <div>Status</div>
        <div>
          <Chip
            color={docData.status === 'published'
              ? 'green'
              : docData.status === 'draft'
                ? 'blue'
                : 'indigo'}
          >
            {capitalize(`${docData.status}`)}
          </Chip>
        </div>
      </div>
    {/if}
  {/if}

  {#if $previewConfig}
    <div class="section-title">Preview</div>
    <div class="preview-buttons">
      {#if docData.status === 'published'}
        <Button
          href={$previewConfig.published}
          on:click={(evt) => {
            evt.preventDefault();
            openWindow(
              $previewConfig.published,
              `sidebar_preview_open` + docData.documentId,
              'location=no'
            );
          }}
        >
          Open published preview
        </Button>
      {:else}
        <Button
          href={$previewConfig.draft}
          on:click={(evt) => {
            evt.preventDefault();
            openWindow(
              $previewConfig.draft,
              `sidebar_preview_open` + docData.documentId,
              'location=no'
            );
          }}
        >
          Open draft preview
        </Button>
      {/if}
    </div>
  {/if}

  {#if features.versions && versionsList}
    <div class="section-title">Versions</div>
    {#if versionsList.length > 0}
      <div class="versions-section">
        {#each versionsList.slice(0, truncateVersionsList ? 3 : undefined) as version}
          <!-- format the date to only include the time when it is not a timestamp -->
          <!-- from a day with cosolidated versions -->
          {@const formattedDate = (() => {
            if (version.timestamp === 'Latest published version') {
              return version.timestamp;
            }
            // time of day is empty for consolidated versions
            if (version.timestamp.includes('T00:00:00.000Z')) {
              return formatISODate(version.timestamp, true, true, false);
            }
            return formatISODate(version.timestamp, true, true, true);
          })()}

          <!-- fall back to Unknown user when there are no users attributed to a version -->
          {@const users = version.users.length > 0 ? version.users.map((user) => user.name) : ['']}

          <Button
            href={version.path}
            on:click={(evt) => {
              evt.preventDefault();
              openWindow(
                version.path,
                `sidebar_version_open` + docData.documentId + version.timestamp,
                'location=no'
              );
            }}
          >
            <div class="version-card">
              <div>{formattedDate}</div>
              <div style="color: var(--fds-text-secondary);">{listOxford(users)}</div>
              <div style="margin-top: 6px;">
                <Chip
                  color={version.status === 'published'
                    ? 'green'
                    : version.status === 'draft'
                      ? 'blue'
                      : 'indigo'}
                >
                  {capitalize(`${version.status}`)}
                </Chip>
              </div>
            </div>
          </Button>
        {/each}
      </div>
      {#if versionsList.length > 3}
        {#if truncateVersionsList}
          <Button style="margin-top: 6px;" on:click={() => (truncateVersionsList = false)}>
            Show more versions
          </Button>
        {:else}
          <Button style="margin-top: 6px;" on:click={() => (truncateVersionsList = true)}>
            Show fewer versions
          </Button>
        {/if}
      {/if}
    {:else}
      <TextBlock>No versions are available for this document.</TextBlock>
    {/if}
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

  .preview-buttons {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .preview-buttons :global(.button) {
    width: fit-content;
  }

  .versions-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .version-card {
    padding: 6px 4px;
    font-family: var(--fds-font-family-text);
    font-size: 14px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0px;
    user-select: none;
    width: 100%;
  }
</style>
