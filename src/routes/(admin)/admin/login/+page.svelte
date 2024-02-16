<script lang="ts">
  import { browser } from '$app/environment';
  import { title } from '$stores/title';
  import { MDCRipple } from '@material/ripple';
  import Button, { Label } from '@smui/button';
  import Textfield from '@smui/textfield';
  import { onMount } from 'svelte';
  import type { ActionData } from './$types';

  export let form: ActionData;

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
      <p class="instruction-heading">Sign in</p>
      <p class="instruction-sub">with your administrative credentials</p>
    </div>
    <form method="POST">
      <Textfield
        value=""
        variant="outlined"
        label="Email"
        class="member-email"
        input$name="email"
        type="email"
        autocomplete="email-current"
        invalid={form?.incorrectPassword || form?.missingEmail}
      />
      <Textfield
        value=""
        variant="outlined"
        label="Password"
        class="member-pass"
        input$name="password"
        type="password"
        autocomplete="password-current"
        invalid={form?.incorrectPassword || form?.missingPassword}
      />
      {#if form?.incorrectPassword}
        <p class="password-wrong">
          Wrong username or password. Try again or contact the webmaster for assistance.
        </p>
      {/if}
      {#if form?.missingEmail}
        <p class="password-wrong">You must specify a valid email address.</p>
      {/if}
      {#if form?.missingPassword}
        <p class="password-wrong">You must specify a password.</p>
      {/if}
      {#if form?.connectionError}
        <p class="password-wrong">We couldn't connect to the server. Try again later.</p>
      {/if}
      {#if form?.unknownServerError}
        <p class="password-wrong">An unknown server error occurred. Try again later.</p>
      {/if}
      {#if form?.unknownError}
        <p class="password-wrong">An unknown error occurred. Try again later.</p>
      {/if}
      {#if form?.rateLimit}
        <p class="password-wrong">Too many attempts. Try again in a few minutes.</p>
      {/if}
      <p class="password-question">
        Don't know your username or password? Request for your credentials to be reset by the
        Webmaster.
      </p>
      <Button href="/contact-webmaster/" variant="text" class="contact">
        <Label>Contact Webmaster</Label>
      </Button>
      <div class="submit-button">
        <Button type="submit" value="Submit" variant="raised">
          <Label>Submit</Label>
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
    max-height: 450px;
    min-height: 450px;
    background: #ffffff;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),
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
    :global(.member-email) {
      width: 100%;
      margin: 32px 0 8px 0;
    }
    :global(.member-pass) {
      width: 100%;
      margin: 0 0 8px 0;
    }
    .submit-button {
      text-align: right;
    }
    :global(a.contact) {
      margin: 6px 0 0 -8px;
    }
    .password-wrong {
      font-family: var(--font-detail);
      color: var(--color-secondary);
      font-size: 12px;
      line-height: 1.4286;
      margin-top: 0px;
      margin-bottom: 0;
    }
    .password-question {
      font-family: var(--font-detail);
      color: var(--color-neutral-160);
      font-size: 14px;
      line-height: 1.4286;
      margin-top: 20px;
      margin-bottom: 0;
    }
    :global(.submit-button .mdc-button) {
      padding: 0 24px;
      margin-top: 20px;
    }
  }
</style>
