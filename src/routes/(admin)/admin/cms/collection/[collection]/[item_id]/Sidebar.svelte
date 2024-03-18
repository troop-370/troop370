<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { SelectOne } from '$lib/common/Select';
  import { formatISODate } from '$utils/formatISODate';
  import { genAvatar } from '$utils/genAvatar';
  import { listOxford } from '$utils/listOxford';
  import { openWindow } from '$utils/openWindow';
  import type { AwarenessUser, YStore } from '$utils/y/createYStore';
  import type { DeconstructedSchemaDefType } from '$utils/y/deconstructSchema';
  import {
    Button,
    IconButton,
    InfoBar,
    MenuFlyout,
    MenuFlyoutItem,
    PersonPicture,
    ProgressRing,
    TextBlock,
    Tooltip,
  } from 'fluent-svelte';
  import type { Readable } from 'svelte/store';
  import type { Action } from './+layout';

  export let docInfo: {
    id: number;
    createdAt: string | undefined;
    modifiedAt: string | undefined;
    collectionName: string;
  };
  export let actions: Action[] = [];
  export let disabled = false;
  export let ydoc: YStore['ydoc'];
  export let stageDef: DeconstructedSchemaDefType[0][1] | undefined = undefined;
  export let sharedData: Readable<Record<string, unknown>>;
  export let fullSharedData: Readable<Record<string, unknown>>;
  export let awareness: Readable<AwarenessUser[] | null>;
  export let preview: { previewUrl?: string; refreshDocData?: () => Promise<void> } = {};
  export let hideVersions = false;

  $: versionsList = $ydoc?.getArray<{ timestamp: string; users: AwarenessUser[] }>(
    '__internal_versionsList'
  );
  let truncateVersionsList = true;

  let crushPreviewLoading = false;

  interface Features {
    actions?: boolean;
    docInfo?: boolean;
    stage?: boolean;
    current?: boolean;
    preview?: boolean;
    download?: boolean;
    access?: boolean;
    versions?: boolean;
  }

  // these props cannot be required
  export let isEmbedded = false;
  export let features: Features = {
    actions: true,
    docInfo: true,
    stage: true,
    current: true,
    preview: true,
    download: true,
    access: true,
    versions: true,
  };

  $: onlyOneFeature = Object.values(features).filter((v) => v === true).length === 1;

  let actionsMenuOpen = false;
  $: watchAction = actions.find((action) => action.id === 'watch');
  $: shareAction = actions.find((action) => action.id === 'share');
  $: restActions = actions.filter(
    (action) => action.id !== watchAction?.id && action.id !== shareAction?.id
  );
</script>

<aside class="wrapper" class:isEmbedded>
  {#if features.actions}
    <div class="button-row" style={!watchAction && !shareAction ? 'justify-content: end;' : ''}>
      {#if watchAction}
        {@const { action, disabled, onAuxClick, tooltip, icon, label, loading } = watchAction}
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

      {#if shareAction}
        {@const { action, disabled, onAuxClick, tooltip, icon, label, loading } = shareAction}
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
          class={!watchAction && !shareAction ? '' : 'solid-icon-button'}
          style="width: 100%; {!watchAction && !shareAction
            ? 'justify-content: space-between;'
            : ''}"
          on:click={() => (actionsMenuOpen = !actionsMenuOpen)}
        >
          {#if !watchAction && !shareAction}
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
    <div class="section-title" class:hidden={onlyOneFeature}>Document information</div>
    <div class="doc-info-row">
      <div>ID</div>
      <div>{docInfo.id}</div>
    </div>
    <div class="doc-info-row">
      <div>Created</div>
      <div>
        {#if docInfo.createdAt}
          {formatISODate(docInfo.createdAt, undefined, undefined, true)}
        {:else}
          ⋯
        {/if}
      </div>
    </div>
    <div class="doc-info-row">
      <div>Last updated</div>
      <div>
        {#if docInfo.modifiedAt}
          {formatISODate(docInfo.modifiedAt, undefined, undefined, true)}
        {:else}
          ⋯
        {/if}
      </div>
    </div>
  {/if}

  {#if features.stage && stageDef}
    <div class="section-title" class:hidden={onlyOneFeature}>Stage</div>
    <SelectOne
      disabled={disabled || $sharedData.stage === 5.2}
      {ydoc}
      ydocKey="stage"
      options={stageDef.field?.options?.map((opt) => {
        return {
          label: opt.label,
          _id: opt.value.toString(),
          disabled: opt.disabled,
        };
      }) || []}
      showCurrentSelectionOnDropdown
      hideSelected={false}
    />
  {/if}

  {#if features.current}
    <div class="section-title" class:hidden={onlyOneFeature}>Current editors</div>
    <div style="margin-left: -8px; display: flex; flex-direction: row; flex-wrap: wrap;">
      {#if $awareness}
        {#each $awareness as user, index}
          {@const left =
            index === 0 ||
            index === 1 ||
            index === 6 ||
            index === 7 ||
            index === 12 ||
            index === 13 ||
            index === 18 ||
            index === 19 ||
            index === 24}
          {@const right =
            index === 4 ||
            index === 5 ||
            index === 10 ||
            index === 11 ||
            index === 16 ||
            index === 17 ||
            index === 22 ||
            index === 23}
          <Tooltip
            text={user.name}
            delay={0}
            alignment={left ? 'start' : right ? 'end' : 'center'}
            followCursor
          >
            <IconButton
              href={`/admin/settings/users`}
              on:click={(evt) => {
                evt.preventDefault();
                openWindow(
                  `/admin/settings/users`,
                  'sidebar_user' + docInfo.id + user._id,
                  'location=no',
                  { width: 500, height: 700 }
                );
              }}
            >
              <PersonPicture
                size={21.2}
                src={user.photo}
                alt={user.name}
                class="sidebar-person-picture"
                style="color: {user.color};"
              />
            </IconButton>
          </Tooltip>
        {/each}
      {/if}
    </div>
  {/if}

  {#if features.preview && preview.previewUrl}
    <!-- legacy preview popop -->
    <div class="section-title" class:hidden={onlyOneFeature}>Preview popout (legacy)</div>

    <InfoBar
      severity="caution"
      title="Resource-intensive action"
      closable={false}
      style="margin-bottom: 5px;"
    >
      It make take a while to open the preview.
    </InfoBar>

    <Button
      on:click={async () => {
        crushPreviewLoading = true;
        openWindow(`${preview.previewUrl}`, `sidebar_preview` + docInfo.id, 'location=no');
        // await preview?.refreshDocData?.();
        // await tick();
        // const crushed = JSONCrush.crush(JSON.stringify($fullSharedData));
        // window.open(
        //   preview.previewUrl + `?data=${encodeURIComponent(crushed)}`,
        //   `sidebar_crush_preview` + docInfo.id,
        //   'location=no'
        // );
        crushPreviewLoading = false;
      }}
      on:auxclick={async () => {
        crushPreviewLoading = true;
        // await preview?.refreshDocData?.();
        // await tick();
        // console.log(JSONCrush.crush(JSON.stringify($fullSharedData)));
        console.log($fullSharedData);
        crushPreviewLoading = false;
      }}
      style="width: 140px;"
    >
      {#if crushPreviewLoading}
        <ProgressRing size={16} />
      {:else}
        <FluentIcon name="Open24Regular" mode="buttonIconLeft" />
        Open preview
      {/if}
    </Button>
  {/if}

  <!-- {#if features.download && docInfo.collectionName === 'File'}
    <div class="section-title" class:hidden={onlyOneFeature}>Download</div>
    <Button
      on:click={async () => {
        const href = `${import.meta.env.VITE_API_PROTOCOL}//${
          import.meta.env.VITE_API_BASE_URL
        }/filestore/${tenant}/${docInfo.id}`;
        window.open(href, `sidebar_preview` + docInfo.id + 'File', 'location=no');
      }}
    >
      <FluentIcon name="Open24Regular" mode="buttonIconLeft" />
      Open file for download
    </Button>
  {/if} -->

  {#if features.versions && versionsList && !hideVersions}
    <div class="section-title" class:hidden={onlyOneFeature}>Versions</div>
    {#if versionsList.length > 0}
      <div class="versions-section">
        {#each versionsList
          ?.toArray()
          .reverse()
          .slice(0, truncateVersionsList ? 3 : undefined) as version}
          <!-- format the date to only include the time when it is not a timestamp -->
          <!-- from a day with cosolidated versions -->
          {@const formattedDate = (() => {
            // time of day is empty for consolidated versions
            if (version.timestamp.includes('T00:00:00.000Z')) {
              return formatISODate(version.timestamp, true, true, false);
            }
            return formatISODate(version.timestamp, true, true, true);
          })()}

          <!-- fall back to Unknown user when there are no users attributed to a version -->
          {@const users =
            version.users.length > 0 ? version.users.map((user) => user.name) : ['Unknown']}

          {@const url = (() => {
            const url = new URL(window.location.href);
            url.pathname = url.pathname + '/version/' + version.timestamp;
            return url;
          })()}

          <Button
            href={url.href}
            on:click={(evt) => {
              evt.preventDefault();
              openWindow(
                url,
                `sidebar_version_open` + docInfo.id + version.timestamp,
                'location=no'
              );
            }}
          >
            <div class="version-card">
              <div>{formattedDate}</div>
              <div style="color: var(--fds-text-secondary);">{listOxford(users)}</div>
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

  /* .access-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .access-section :global(.person-photo) {
    width: 24px;
    height: 24px;
  }

  article.team {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 14px;
    padding: 3px 0;
    width: 100%;
  }

  .team-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  img.team-photo {
    border-radius: var(--fds-control-corner-radius);
    box-shadow: inset 0 0 0 1.5px black;
    -webkit-user-drag: none;
    width: 24px;
    height: 24px;
  } */

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

  .button-progress {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  :global(.sidebar-person-picture) {
    border: none !important;
    box-shadow: 0 0 0 2.4px currentColor;
    -webkit-user-drag: none;
  }
</style>
