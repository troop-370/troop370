<slot />

<style lang="scss">
  @use '@material/button/index' as mdc-button;
  @use '@material/ripple/index' as mdc-ripple;

  :global(.mdc-button-outlined--on-primary) {
    @include mdc-button.ink-color(#e0e0e0);
    @include mdc-button.outline-color(#e0e0e0);
  }

  :global(.mdc-button-outlined--on-primary .mdc-button__ripple) {
    @include mdc-ripple.states-base-color('on-primary');
  }

  /* use correct font for button labels */
  :global(.mdc-button .mdc-button__label),
  :global(.mdc-tab .mdc-tab__text-label) {
    text-transform: uppercase;
    font-family: var(--font-headline);
    font-weight: 700;
  }
</style>
