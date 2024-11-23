<script lang="ts">
  import { browser } from '$app/environment';
  import { Chip } from '$lib/common/Chip';
  import Loading from '$lib/common/Loading.svelte';
  import AwesomeDebouncePromise from 'awesome-debounce-promise';
  import { Button, ProgressRing, TextBox } from 'fluent-svelte';
  import type { Writable } from 'svelte/store';

  export let key: string;
  export let docData: Writable<Record<string, unknown>>;
  export let collectionUID: string;
  export let sessionAdminToken: string | undefined;
  export let disabled = false;

  let loading = false;

  async function generateStrapiUID(
    contentTypeUID: string,
    field: string,
    data: Record<string, any>,
    token: string | undefined
  ) {
    return fetch('/strapi/content-manager/uid/generate', {
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

  let loadingAvailability = false;
  async function _checkAvailability(contentTypeUID: string, field: string, value: string) {
    loadingAvailability = true;
    return fetch('/strapi/content-manager/uid/check-availability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionAdminToken}`,
      },
      body: JSON.stringify({ contentTypeUID, field, value }),
    })
      .then((res) => res.json())
      .then(({ isAvailable }) => {
        return isAvailable as boolean;
      })
      .finally(() => {
        loadingAvailability = false;
      });
  }
  const checkAvailability = browser ? AwesomeDebouncePromise(_checkAvailability, 500) : undefined;

  // check if the current value is available
  let available: boolean | undefined = undefined;
  const originalValue = `${$docData[key]}`;
  $: {
    const currentValue = `${$docData[key]}`;
    if (currentValue) {
      if (currentValue === originalValue) {
        available = undefined;
      } else {
        checkAvailability?.(collectionUID, key, currentValue).then((res) => (available = res));
      }
    }
  }
</script>

<TextBox id={key} bind:value={$docData[key]} {disabled}>
  {#if available === false}
    <div style="margin-right: 3px;">
      <Chip color="danger">Unavailable</Chip>
    </div>
  {/if}
</TextBox>
<div class="actions">
  <Button
    {disabled}
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

  {#if loadingAvailability}
    <Loading message="Checking availability…" />
  {/if}
</div>

<style>
  .actions {
    display: flex;
    flex-direction: row;
    padding: 6px 0 0;
    gap: 10px;
  }
</style>
