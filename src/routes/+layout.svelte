<script lang="ts">
  import { browser } from '$app/environment';
  import { themeMode } from '$stores/themeMode';
  import { theme as themeFunction } from '$utils/theme';
  import 'fluent-svelte/theme.css';
  import { toCustomPropertiesString } from 'object-to-css-variables';
  import { onDestroy, onMount } from 'svelte';

  // update meta theme color to match titlebar based on theme mode
  $: {
    if (browser) {
      const currentMetaTheme = document?.querySelector('meta[name=theme-color]');
      if (currentMetaTheme) {
        currentMetaTheme.remove();
        const newMeta = document.createElement('meta');
        newMeta.name = 'theme-color';
        newMeta.content = $themeMode === 'dark' ? '#202020' : '#f3f3f3';
        document.head.appendChild(newMeta);
      }
    }
  }

  // get the theme
  $: theme = themeFunction($themeMode);
  $: themeVars = toCustomPropertiesString(theme);

  // listen for when user changes system theme preference
  function setCorrectThemeMode(evt: MediaQueryListEvent) {
    if (evt.matches) $themeMode = 'dark';
    else $themeMode = 'light';
  }
  onMount(() => {
    if (browser)
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', setCorrectThemeMode);
  });
  onDestroy(() => {
    if (browser)
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', setCorrectThemeMode);
  });

  // inject the theme variables as custom properties
  $: {
    if (themeVars && browser) {
      const styleElem = (() => {
        const existing = document.querySelector('style#theme');
        if (existing) return existing;
        const newElem = document.createElement('style');
        newElem.id = 'theme';
        document.head.appendChild(newElem);
        return newElem;
      })();
      styleElem.innerHTML = `:root { ${themeVars} }`;
    }
  }
</script>

<slot />

<style>
  /* links */
  :global(a) {
    color: var(--windowAccent);
  }

  /* collaboration */
  :global(.collaboration-cursor__caret) {
    position: relative;
    margin-left: -0.5px;
    margin-right: -0.5px;
    border-left: 0.5px solid #0d0d0d;
    border-right: 0.5px solid #0d0d0d;
    word-break: normal;
    pointer-events: none;
  }
  :global(.collaboration-cursor__label) {
    position: absolute;
    top: -1.4em;
    left: -1px;
    font-size: 12px;
    font-style: normal;
    font-weight: 680;
    line-height: normal;
    user-select: none;
    color: #111111;
    font-family: var(--fds-font-family-small);
    padding: 0.1rem 0.3rem;
    border-radius: 0;
    white-space: nowrap;
  }

  /* acrylic menys */
  @supports (backdrop-filter: var(--fds-acrylic-blur-factor)) {
    @keyframes fadein {
      0% {
        opacity: 0;
      }
      99% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }

    @keyframes clearBackgroundColor {
      0% {
        background-color: var(--fds-solid-background-quarternary);
      }
      50% {
        background-color: var(--fds-solid-background-quarternary);
      }
      100% {
        background-color: transparent;
      }
    }

    @keyframes clearBackgroundColorDark {
      0% {
        background-color: #222;
      }
      50% {
        background-color: #222;
      }
      100% {
        background-color: transparent;
      }
    }

    :global(html[tauri='false'] .menu-flyout-anchor .menu-flyout) {
      background-color: transparent;
    }
    :global(html[tauri='false'] .flyout-anchor .flyout) {
      animation: clearBackgroundColor 500ms ease forwards;
    }
    @media (prefers-color-scheme: dark) {
      :global(html[tauri='false'] .flyout-anchor .flyout) {
        animation: clearBackgroundColorDark 500ms ease forwards;
      }
    }

    :global(html[tauri='false'] .menu-flyout-anchor .menu-flyout-surface-container::before),
    :global(html[tauri='false'] .flyout-anchor .flyout::before) {
      content: '';
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      width: 100%;
      height: 100%;
      position: absolute;
      z-index: -2;
      background: var(--fds-acrylic-background-default);
      background-blend-mode: color, luminosity;
      backdrop-filter: var(--fds-acrylic-blur-factor);
      border-radius: var(--fds-overlay-corner-radius);
    }
    :global(html[tauri='false'] .menu-flyout-anchor .menu-flyout-surface-container::after),
    :global(html[tauri='false'] .flyout-anchor .flyout::after) {
      content: '';
      position: absolute;
      inset: 0;
      inline-size: 100%;
      block-size: 100%;
      content: '';
      background: var(--acrylic-noise-asset) center/256px repeat;
      inset: 0;
      z-index: -1;
      opacity: 0.02;
      border-radius: var(--fds-overlay-corner-radius);
    }
  }

  :global(html[tauri='false'] .menu-flyout-anchor .menu-flyout-surface-container::before),
  :global(html[tauri='false'] .menu-flyout-anchor .menu-flyout-surface-container::after),
  :global(html[tauri='false'] .flyout-anchor .flyout::before),
  :global(html[tauri='false'] .flyout-anchor .flyout::after) {
    --fds-overlay-corner-radius: 8px;
    --fds-acrylic-blur-factor: blur(60px) saturate(125%) brightness(108%);

    --fds-acrylic-background-default: transparent, rgba(252, 252, 252, 85%);
    --fds-acrylic-noise-asset: url('data:image/png;base64,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');
  }

  @media (prefers-color-scheme: dark) {
    :global(html[tauri='false'] .menu-flyout-anchor .menu-flyout-surface-container::before),
    :global(html[tauri='false'] .menu-flyout-anchor .menu-flyout-surface-container::after),
    :global(html[tauri='false'] .flyout-anchor .flyout::before),
    :global(html[tauri='false'] .flyout-anchor .flyout::after) {
      --fds-acrylic-blur-factor: blur(32px) saturate(600%);
      --fds-acrylic-background-default: linear-gradient(
          0deg,
          rgb(44, 44, 44, 15%),
          rgb(44, 44, 44, 15%)
        ),
        rgba(33, 33, 33, 80%);
    }
  }

  /* content dialogs */
  :global(:root .content-dialog-smoke .content-dialog) {
    max-height: calc(100vh - env(titlebar-area-height, 32px) - 40px);
    margin-top: 20px;
    display: flex;
    flex-direction: column;
  }
  :global(:root .content-dialog-smoke .content-dialog .content-dialog-body) {
    overflow-x: hidden;
    overflow-y: auto;
    flex-grow: 1;
  }
  :global(:root .content-dialog-smoke .content-dialog .content-dialog-body > h4) {
    position: sticky;
    top: 0;
    z-index: 1;
  }
  :global(:root .content-dialog-smoke .content-dialog .content-dialog-body > h4::before),
  :global(:root .content-dialog-smoke .content-dialog .content-dialog-body > h4::after) {
    content: '';
    position: absolute;
    top: -24px;
    left: -24px;
    bottom: -12px;
    right: -24px;
    padding: 24px;
    z-index: -1;
  }
  :global(:root .content-dialog-smoke .content-dialog .content-dialog-body > h4::before) {
    background-color: var(--fds-solid-background-base);
  }
  :global(:root .content-dialog-smoke .content-dialog .content-dialog-body > h4::after) {
    background-color: var(--fds-layer-background-default);
  }

  /* :global(:root .content-dialog-smoke .content-dialog .content-dialog-body > div.error) {
    position: absolute;
    bottom: 62px;
    z-index: 1;
    width: calc(100% - 48px);
  } */
  :global(:root .content-dialog-smoke .content-dialog .content-dialog-body > div.error) {
    margin-bottom: 10px;
  }
  :global(:root .content-dialog-smoke .content-dialog footer) {
    grid-auto-columns: 1fr;
  }

  /* use box shadow instead of border so that the pixel size is always correct */
  /* darker underline */
  :global(:root .button.style-standard) {
    border: none !important;
    --fds-control-stroke-secondary-overlay: hsla(0, 0%, 0%, 10.44%);
    box-shadow: inset 0 0 0 1px var(--fds-control-stroke-default),
      inset 0 -1px 0 0 var(--fds-control-stroke-secondary-overlay);
    /* padding: 5px 12px 6.5px 12px; */
  }
  @media (prefers-color-scheme: dark) {
    :global(:root .button.style-standard) {
      --fds-control-stroke-secondary-overlay: hsla(0, 0%, 0%, 2.32%);
    }
  }
  /* uniform underline */
  :global(:root .button.style-standard):active,
  :global(:root .text-box-container) {
    border: none !important;
    box-shadow: inset 0 0 0 1px var(--fds-control-stroke-default);
  }
  :global(:root .checkbox[type='checkbox']:not(:checked)) {
    border: none !important;
    box-shadow: inset 0 0 0 1px var(--fds-control-strong-stroke-default);
  }
  :global(:root .checkbox[type='checkbox']:disabled) {
    box-shadow: inset 0 0 0 1px var(--fds-control-strong-stroke-disabled);
  }
  :global(:root .text-box-underline) {
    block-size: calc(100% + 0px) !important;
    inline-size: calc(100% + 0px) !important;
    inset-block-start: 0px !important;
    inset-inline-start: 0px !important;
  }
  :global(:root .text-box-underline)::after {
    border: none !important;
    box-shadow: inset 0 -1px 0 0 var(--fds-control-strong-stroke-default);
  }
  :global(:root .text-box-container:focus-within .text-box-underline):after {
    border: none !important;
    box-shadow: inset 0 -2px 0 0 var(--fds-accent-default);
  }

  /* force dropdowns to be scrollable instead of eventually overflowing out of the container */
  :global(:root .combo-box-dropdown) {
    overflow: auto;
  }
</style>
