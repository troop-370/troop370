<script lang="ts">
  import { compactMode } from '$stores/compactMode';
  import { themeMode } from '$stores/themeMode';
  import { theme, type colorShade as colorShadeType, type colorType } from '$utils/theme/theme';
  import Color from 'color';
  import { Button } from 'fluent-svelte';

  export let href: string | undefined = undefined;
  export let compact = $compactMode;

  export let color: colorType = 'green';
  export let shade: { dark: colorShadeType; light: colorShadeType } = { dark: 300, light: 800 };
  $: themeColor =
    color === 'neutral' || !color
      ? theme($themeMode).color.neutral[$themeMode]
      : theme($themeMode).color[color];
  $: colorShade = (() => {
    if (color === 'neutral') return 1200;
    return $themeMode === 'light' ? shade.light : shade.dark;
  })();
</script>

<Button
  {href}
  tabIndex={href ? 0 : -1}
  variant="hyperlink"
  style="
    height: {compact ? 24 : 30}px;
    color: currentColor;
    font-size: 0.75rem;
    padding: 0 {compact ? 6 : 10}px;
    cursor: default;
    font-size: 13px;
    color: var(--color-{color}{color === 'neutral' ? `-${$themeMode}` : ''}-{colorShade});
    box-shadow: {Color(themeColor[colorShade]).alpha(0.14).string()} 0px 0px 0px 1.25px inset;
    --fds-subtle-fill-transparent: {color === 'neutral'
    ? 'transparent'
    : Color(themeColor[colorShade]).alpha(0.05).string()};
    --fds-subtle-fill-secondary: {href
    ? Color(themeColor[colorShade]).alpha(0.11).string()
    : `var(--fds-subtle-fill-transparent)`};
    --fds-subtle-fill-tertiary: {href
    ? Color(themeColor[colorShade]).alpha(0.17).string()
    : `var(--fds-subtle-fill-transparent)`};
    white-space: nowrap;
    {$$restProps['style']}
  "
  {...$$restProps}
>
  <slot />
</Button>
