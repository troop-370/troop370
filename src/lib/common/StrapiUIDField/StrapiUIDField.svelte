<script lang="ts">
  import { Button, ProgressRing, TextBox } from 'fluent-svelte';
  import type { Writable } from 'svelte/store';

  export let key: string;
  export let docData: Writable<Record<string, any>>;
  export let collectionUID: string;
  export let sessionAdminToken: string | undefined;

  let loading = false;

  async function generateStrapiUID(
    contentTypeUID: string,
    field: string,
    data: Record<string, any>,
    token: string | undefined
  ) {
    return fetch('/admin/strapi/content-manager/uid/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ contentTypeUID, data, field }),
    })
      .then((res) => res.json())
      .then(({ data }) => {
        return data as string;
      });
  }
</script>

<TextBox id={key} bind:value={$docData[key]} />
<div class="actions">
  <Button
    on:click={() => {
      loading = true;
      generateStrapiUID(collectionUID, key, $docData, sessionAdminToken)
        .then((newUID) => {
          $docData[key] = newUID;
        })
        .finally(() => {
          loading = false;
        });
    }}
  >
    {#if loading}
      <ProgressRing style="--fds-accent-default: currentColor; position: absolute;" size={16} />
    {/if}
    <div style="display: flex; visibility: {loading ? 'hidden' : 'visible'};">Regenerate</div>
  </Button>
</div>

<style>
  .actions {
    display: flex;
    flex-direction: row;
    padding: 6px 0 0;
    gap: 10px;
  }
</style>
