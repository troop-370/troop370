<script lang="ts">
  import { browser } from '$app/environment';
  import { title } from '$stores/title';
  import { MDCRipple } from '@material/ripple';
  import Button, { Label } from '@smui/button';
  import { onMount } from 'svelte';

  $: title.set('Sign in to continue');

  onMount(() => {
    if (browser) {
      const buttonElems = document.querySelectorAll('.mdc-button');
      buttonElems.forEach((buttonElem) => {
        MDCRipple.attachTo(buttonElem);
      });
    }
  });
</script>

<div class="wrapper">
  <div class="main-box">
    <div>
      <p class="logo">Troop 370</p>
      <p class="instruction-heading">Sign in with Constant Contact</p>
      <p class="instruction-sub">to view and send emails</p>
    </div>
    <form method="POST">
      <div class="submit-button">
        <Button type="submit" value="Submit" variant="raised">
          <Label>Sign in with Constant Contact</Label>
        </Button>
      </div>
    </form>
  </div>
</div>

<style lang="scss">
  .wrapper {
    position: relative;
    background: #ffffff;
    height: 100vh;
    color: var(--color-neutral-200);
  }

  .main-box {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: block;
    width: 360px;
    max-height: 380px;
    min-height: 380px;
    background: #ffffff;
    box-shadow:
      0 2px 2px 0 rgba(0, 0, 0, 0.14),
      0 1px 5px 0 rgba(0, 0, 0, 0.12),
      0 3px 1px -2px rgba(0, 0, 0, 0.2);
    padding: 45px;
    margin: auto;
    @media (max-width: 600px) {
      width: unset;
      max-height: unset;
      min-height: unset;
      height: calc(100vh - 90px);
      top: 0;
      left: 0;
      transform: none;
    }
    p.logo {
      font-family: var(--font-headline);
      font-weight: 600;
      font-size: 1.5em;
      line-height: 1em;
      color: var(--color-primary);
      margin: 0;
      text-align: center;
    }
    p.instruction-heading {
      font-family: var(--font-headline);
      font-weight: 400;
      font-size: 1.5em;
      line-height: 1.333em;
      margin: 0 0 -2px 0;
      text-align: center;
      padding-top: 22px;
    }
    p.instruction-sub {
      font-family: var(--font-detail);
      font-weight: 400;
      font-size: 1em;
      line-height: 1.5em;
      margin: 0;
      text-align: center;
      padding-top: 8px;
    }

    :global(.submit-button .mdc-button) {
      padding: 20px 24px;
      margin-top: 40px;
      width: 100%;
    }
  }
</style>
