<script lang="ts">
  import { camelToDashCase } from '$utils/camelToDashCase';
  import * as icons from '@fluentui/svg-icons';

  export let name: string = '';
  $: type = name.slice(-7) === 'Regular' ? 'regular' : 'filled';
  $: size = type === 'regular' ? name.slice(-9, -7) : name.slice(-8, -6);
  $: pascalName = type === 'regular' ? name.slice(0, -9) : name.slice(0, -8);
  $: snakeName = camelToDashCase(pascalName).replaceAll('-', '_');
  $: iconName = `${snakeName}_${size}_${type}`;

  export let style = '';

  type FluentIcon = keyof typeof icons;
  function isFluentIconName(str: string): str is FluentIcon {
    const iconNames = Object.keys(icons);
    return iconNames.includes(str);
  }

  export let mode:
    | 'regular'
    | 'buttonIconLeft'
    | 'buttonIconRight'
    | 'bodyStrongLeft'
    | 'ribbonButtonIconLeft'
    | 'ribbonButtonIconRight' = 'regular';

  const injectStyle = (str: string) => str.replace('<svg ', `<svg style="${style}" `);
</script>

{#if mode === 'regular'}
  {#if isFluentIconName(iconName)}
    {@html injectStyle(icons[iconName])}
  {:else if $$slots.default}
    <slot />
  {/if}
{:else if mode === 'ribbonButtonIconLeft'}
  <span style="margin: 1.5px 6px 0 0;" class="button-icon ribbon-icon">
    {#if isFluentIconName(iconName)}
      {@html injectStyle(icons[iconName])}
    {:else if $$slots.default}
      <slot />
    {/if}
  </span>
{:else if mode === 'ribbonButtonIconRight'}
  <span style="margin: 1.5px 0 0 6px;" class="button-icon">
    {#if isFluentIconName(iconName)}
      {@html injectStyle(icons[iconName])}
    {:else if $$slots.default}
      <slot />
    {/if}
  </span>
{:else if mode === 'buttonIconLeft'}
  <span style="margin: 0 12px 0 0;" class="button-icon">
    {#if isFluentIconName(iconName)}
      {@html injectStyle(icons[iconName])}
    {:else if $$slots.default}
      <slot />
    {/if}
  </span>
{:else if mode === 'buttonIconRight'}
  <span style="margin: 0 0 0 12px;" class="button-icon">
    {#if isFluentIconName(iconName)}
      {@html injectStyle(icons[iconName])}
    {:else if $$slots.default}
      <slot />
    {/if}
  </span>
{:else if mode === 'bodyStrongLeft'}
  <span style="margin: 0 6px 0 0;" class="body-text-icon">
    {#if isFluentIconName(iconName)}
      {@html injectStyle(icons[iconName])}
    {:else if $$slots.default}
      <slot />
    {/if}
  </span>
{/if}

<style>
  .button-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .body-text-icon {
    vertical-align: middle;
  }
  .button-icon :global(svg),
  .body-text-icon :global(svg) {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }
  .button-icon.ribbon-icon :global(svg) {
    width: 18px;
    height: 18px;
  }

  :global(svg > path.OfficeIconColors_HighContrast:not([class*='OfficeIconColors_m'])) {
    fill: transparent;
  }
  :global(svg > path.OfficeIconColors_m20) {
    fill: #fafafaff;
  }
  :global(svg > path.OfficeIconColors_m21) {
    fill: #c8c6c4ff;
  }
  :global(svg > path.OfficeIconColors_m22),
  .button-icon.ribbon-icon :global(svg) {
    fill: #3a3a38ff;
  }
  :global(svg > path.OfficeIconColors_m23) {
    fill: #797774ff;
  }
  :global(svg > path.OfficeIconColors_m24) {
    fill: #1e8bcdff;
  }
  :global(svg > path.OfficeIconColors_m25) {
    fill: #3a3a38ff;
  }
  :global(svg > path.OfficeIconColors_m26) {
    fill: #83beecff;
  }
  :global(svg > path.OfficeIconColors_m27) {
    fill: #379e4eff;
  }
  :global(svg > path.OfficeIconColors_m213) {
    fill: #ed3d3bff;
  }
  :global(svg > path.OfficeIconColors_m223) {
    fill: #83beecff;
  }
  :global(svg > path.OfficeIconColors_m224) {
    fill: #0063b1ff;
  }
  :global(svg > path.OfficeIconColors_m2226) {
    fill: #de6c00ff;
  }
  :global(svg > path.OfficeIconColors_m2227) {
    fill: #ffffff00;
  }
  :global(svg > path.OfficeIconColors_m2262) {
    fill: #185abdff;
  }

  @media (prefers-color-scheme: dark) {
    :global(svg > path.OfficeIconColors_m20) {
      fill: #00000000;
    }
    :global(svg > path.OfficeIconColors_m21) {
      fill: #5e5e5eff;
    }
    :global(svg > path.OfficeIconColors_m22),
    .button-icon.ribbon-icon :global(svg) {
      fill: #d4d4d4ff;
    }
    :global(svg > path.OfficeIconColors_m23) {
      fill: #989898ff;
    }
    :global(svg > path.OfficeIconColors_m24) {
      fill: #3b9adcff;
    }
    :global(svg > path.OfficeIconColors_m25) {
      fill: #83beecff;
    }
    :global(svg > path.OfficeIconColors_m26) {
      fill: #0063b1ff;
    }
    :global(svg > path.OfficeIconColors_m27) {
      fill: #73dd83ff;
    }
    :global(svg > path.OfficeIconColors_m213) {
      fill: #e94c4fff;
    }
    :global(svg > path.OfficeIconColors_m223) {
      fill: #0063b1ff;
    }
    :global(svg > path.OfficeIconColors_m224) {
      fill: #83beecff;
    }
    :global(svg > path.OfficeIconColors_m2226) {
      fill: #ffffff00;
    }
    :global(svg > path.OfficeIconColors_m2227) {
      fill: #f8b760ff;
    }
    :global(svg > path.OfficeIconColors_m2262) {
      fill: #2b7cd3ff;
    }
  }
</style>
