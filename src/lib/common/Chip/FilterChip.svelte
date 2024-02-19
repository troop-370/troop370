<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { compactMode } from '$stores/compactMode';
  import { themeMode } from '$stores/themeMode';
  import { theme, type colorShade as colorShadeType, type colorType } from '$utils/theme/theme';
  import Color from 'color';
  import { IconButton } from 'fluent-svelte';

  export let compact: boolean | undefined = undefined;
  export let color: { name: colorType; lightShade?: colorShadeType; darkShade?: colorShadeType } = {
    name: 'neutral',
  };
  export let scope = '';
  export let icon = 'Dismiss12Regular';

  $: themeColor =
    color.name === 'neutral'
      ? theme($themeMode).color.neutral[$themeMode]
      : theme($themeMode).color[color.name];
  $: colorShade = $themeMode === 'light' ? color.lightShade || 800 : color.darkShade || 300;
</script>

<div
  class="chip"
  class:compact={compact ?? $compactMode}
  style="
    color: var(--color-{color.name}{color.name === 'neutral' ? `-${$themeMode}` : ''}-{colorShade});
    background-color: {Color(themeColor[colorShade]).alpha(0.1).string()};
    --fds-subtle-fill-secondary: {Color(themeColor[colorShade]).alpha(0.11).string()};
    --fds-subtle-fill-tertiary: {Color(themeColor[colorShade]).alpha(0.17).string()};
  "
  class:useCurrentColor={true}
>
  {#if scope}
    <div
      class="scope"
      class:compact={compact ?? $compactMode}
      style="
        --theme-color: {Color(themeColor[colorShade]).alpha(0.8).string()};
      "
    >
      {scope}
    </div>
  {/if}
  <slot />
  <IconButton
    on:click
    style="
      min-block-size: 12px;
      min-inline-size: 12px;
      box-sizing: border-box;
      padding: {compact ?? $compactMode ? 4 : 6}px;
      margin-right: -{compact ?? $compactMode ? 4 : 6}px;
    "
  >
    <FluentIcon name={icon} />
  </IconButton>
</div>

<style>
  .chip {
    height: 30px;
    color: currentColor;
    border: none;
    border-radius: var(--fds-control-corner-radius);
    font-size: 0.75rem;
    padding: 0 10px;
    cursor: default;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    font-family: var(--fds-font-family-text);
    font-weight: 400;
    line-height: 20px;
    gap: 2px;
    font-size: 13px;
    user-select: none;
    box-shadow: var(--fds-divider-stroke-default) 0px 0px 0px 1.25px inset;
    white-space: nowrap;
  }

  .chip.useCurrentColor {
    box-shadow: currentColor 0px 0px 0px 1.25px inset;
  }

  .chip.compact {
    height: 24px;
    padding: 0 6px;
  }

  .chip :global(svg) {
    block-size: 12px !important;
    inline-size: 12px !important;
  }

  .chip.useCurrentColor :global(.icon-button) {
    color: currentColor;
  }

  .scope {
    background-color: var(--theme-color);
    color: #ffffff;
    height: 100%;
    padding: 0 10px;
    margin-left: -10px;
    margin-right: 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 13px;
    border-radius: var(--fds-control-corner-radius) 0 0 var(--fds-control-corner-radius);
    font-weight: 500;
  }

  .scope.compact {
    margin-left: -6px;
    margin-right: 6px;
    padding: 0 8px;
  }

  @media (prefers-color-scheme: dark) {
    .scope {
      color: #333;
    }
  }
</style>
