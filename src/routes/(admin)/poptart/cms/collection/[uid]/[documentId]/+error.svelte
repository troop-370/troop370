<script lang="ts">
  import { page } from '$app/stores';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { motionMode } from '$stores/motionMode';
  import { TextBlock } from 'fluent-svelte';
  import { expoOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';
</script>

{#if $page.error?.message === 'NO_PERMISSION'}
  <div
    in:fly={{ y: 40, duration: $motionMode === 'reduced' ? 0 : 270, easing: expoOut }}
    class="message-box"
  >
    <FluentIcon
      name="ErrorCircle24Regular"
      style="width: 32px; height: 32px; fill: var(--fds-accent-default);"
    />
    <TextBlock variant="bodyStrong">
      This document does not exist <i>or</i> you do not have access.
    </TextBlock>
    <TextBlock style="margin-top: -14px;">
      If you know this document exists, ask someone with access to grant you access.
    </TextBlock>
  </div>
{/if}

<style>
  .message-box {
    width: 100%;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    align-items: center;
    justify-content: center;
    padding: 8px;
    margin-top: 20px;
  }
</style>
