<script lang="ts">
  import { browser } from '$app/environment';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { ActionRow, PageTitle } from '$lib/common/PageTitle';
  import { title } from '$stores/title';
  import { genAvatar } from '$utils';
  import _ColorHash from 'color-hash';
  import { Button, ProgressRing } from 'fluent-svelte';
  import type { ComponentProps } from 'svelte';
  import Editor from '../[documentId]/Editor.svelte';
  import Sidebar from '../[documentId]/Sidebar.svelte';

  // @ts-expect-error https://github.com/zenozeng/color-hash/issues/42
  const ColorHash: typeof _ColorHash = _ColorHash.default || _ColorHash;
  // @ts-expect-error 'bkdr' is a vlid hash config value
  const colorHash = new ColorHash({ saturation: 0.8, lightness: 0.34, hash: 'bkdr' });

  export let data;
  $: ({ collectionConfig, docDataStore, saving } = data);
  $: ({ docData } = docDataStore);
  $: sidebarDocData = {
    ...$docData,
    documentId: 'Save to create this document',
    status: 'Not created',
  };

  $: if (browser) {
    title.set(
      `${$docDataStore[$collectionConfig.settings.mainField] || 'New document'} - ${$saving ? 'Saving' : 'Unsaved'}`
    );
  }

  $: coreSidebarProps = {
    docData: sidebarDocData,
  } satisfies ComponentProps<Sidebar>;
</script>

<div class="header">
  <PageTitle>Create an entry</PageTitle>

  <ActionRow>
    <Button
      variant="accent"
      disabled={$saving}
      on:click={data.save}
      style="width: 156px; height: 32px;"
    >
      {#if $saving}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        <FluentIcon name="Save16Regular" mode="buttonIconLeft" />
        Create new draft
      {/if}
    </Button>
  </ActionRow>
</div>

<article>
  <Editor
    data={{
      collectionConfig,
      docDataStore,
      session: data.session,
      save: data.save,
      defs: data.defs,
    }}
    actions={[
      {
        label: 'Create new draft',
        id: 'save',
        icon: 'Save16Regular',
        action: data.save,
        disabled: $saving,
      },
    ]}
    {coreSidebarProps}
    user={data.session.adminUser
      ? {
          _id: data.session.adminEmail + data.session.adminUser.id.toString(),
          name: data.session.adminUser.firstname + ' ' + data.session.adminUser.lastname,
          color: colorHash.hex(
            data.session.adminUser.username + data.session.adminUser.id.toString()
          ),
          photo: genAvatar(data.session.adminUser.username + data.session.adminUser.id.toString()),
          sessionId: '0',
        }
      : {
          _id: Math.random().toString(),
          name: 'Unknown',
          color: 'black',
          photo: '',
          sessionId: '0',
        }}
  />

  <br />
  <br />
  <Button
    variant="accent"
    disabled={$saving}
    on:click={data.save}
    style="width: 156px; height: 32px;"
  >
    {#if $saving}
      <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
    {:else}
      <FluentIcon name="Save16Regular" mode="buttonIconLeft" />
      Create new draft
    {/if}
  </Button>
</article>

<style>
  article {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  .header {
    max-width: 840px;
    margin: 0 auto;
  }
</style>
