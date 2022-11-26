<script lang="ts">
  import Button, { Label } from '@smui/button';

  export let href: string;
</script>

<Button variant="outlined" class="mdc-button-outlined--on-primary" {href}>
  <Label><slot /></Label>
</Button>

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
</style>
