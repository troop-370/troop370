<script lang="ts">
  import { browser } from '$app/environment';
  import { onDestroy, onMount } from 'svelte';
  import type { SchemaDef } from '../+layout';
  import type { PageData } from './$types';
  import Fields from './Fields.svelte';

  interface Data {
    collectionConfig: PageData['collectionConfig'];
    docDataStore: PageData['docDataStore'];
    session: App.Locals['session']['data'];
    defs: SchemaDef[];
    save: () => void;
    publish?: () => void;
  }

  export let data: Data;
  $: ({ collectionConfig, docDataStore } = data);
  export let disabled = false;
  let sessionAdminToken = data.session.adminToken;

  let showHiddenFields = false;

  function keyboardShortcuts(evt: KeyboardEvent) {
    // trigger whether hidden fields are shown
    // ALT + SHIFT + H
    if (evt.altKey && evt.shiftKey && evt.key === 'H') {
      evt.preventDefault();
      showHiddenFields = !showHiddenFields;
      return;
    }

    // save the document
    // CTRL + S
    if (evt.ctrlKey && evt.key === 's') {
      evt.preventDefault();
      data.save();
      return;
    }

    // publish the document
    // CTRL + SHIFT + P
    if (evt.ctrlKey && evt.shiftKey && evt.key === 'P') {
      evt.preventDefault();
      data.publish?.();
      return;
    }
  }
  onMount(() => {
    document.addEventListener('keydown', keyboardShortcuts);
  });
  onDestroy(() => {
    if (browser) document.removeEventListener('keydown', keyboardShortcuts);
  });
</script>

<Fields
  defs={data.defs}
  docData={docDataStore}
  {sessionAdminToken}
  variant={showHiddenFields ? 'show-hidden' : 'normal'}
  {disabled}
/>
