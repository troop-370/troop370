<script lang="ts">
  import { page } from '$app/stores';
  import Button from '@smui/button';
  import PayWithVenmo from './PayWithVenmo.svelte';

  $: payload = $page.form?.payload;
  $: orderId = payload?.cart?.order?.id;
  $: amount = payload?.cart?.order?.total;

  $: venmoQR = `venmo://paycharge?audience=private&amount=${amount}&note=${orderId}&recipients=%2CTroop-ThreeSeventy&txn=pay`;
</script>

<h1>Pay with Venmo</h1>
<a href="https://troop370atlanta.org/pay/pinestraw#!/~/checkoutPD">⇐ Return to checkout</a>

{#if !orderId || !amount}
  <div class="instruction">
    <p>Order ID or total amount is missing.</p>
    <p>Return to the previous page and try again.</p>
  </div>
{:else}
  <div class="instruction">
    <h2>Step 1</h2>

    <p>Click or tap the <b>Pay with Venmo</b> button below to pay for your order.</p>

    <p>
      Because this is a purchase of goods, please enable the <b>Turn on for purchases</b> option on the
      final payment step in the Venmo app.
    </p>

    <PayWithVenmo {orderId} {amount} />

    <p>
      Alternatively, you may open the Venmo app and manually enter payment details.
      <br />
      <span>
        Make your payment to <code>@Troop-ThreeSeventy</code> for the amount of
        <code>${amount.toFixed(2)}</code>.
      </span>
      <span>
        In the order notes, specify the order ID (<code>{orderId}</code>).
      </span>
    </p>

    <h2 style="padding-top: 20px;">Step 2</h2>

    <p>Once you finish paying, return to this page and click or tap <b>Complete Order</b>.</p>
    <form method="POST">
      <Button variant="unelevated">Complete order</Button>
    </form>
  </div>
{/if}

<!-- <pre>{JSON.stringify($page?.form?.payload, null, 2)}</pre> -->

<style>
  h1 {
    font-family: var(--font-headline);
    margin: 0 auto;
    padding: 35px 20px 0 20px;
  }

  div.instruction {
    margin: 0 auto;
    padding: 20px;
    font-family: var(--font-detail);
  }

  div.buttons {
    margin: 0 auto;
    padding: 0 20px 20px;
  }

  div.buttons > :global(*:not(:first-child)) {
    margin-top: 20px;
  }

  span {
    margin-left: 20px;
    display: block;
  }

  code {
    background-color: hsla(0, 0%, 0%, 0.1);
    padding: 0.1rem 0.3rem;
    border-radius: var(--radius);
  }

  a {
    display: inline-block;
    margin: 10px 20px 0;
    font-family: var(--font-detail);
  }
  a {
    color: var(--color-primary);
    box-shadow: 0 1px 0 0 var(--color-primary);
    transition:
      background-color 0.2s,
      box-shadow 0.1s,
      color 0.2s;
    text-decoration: none;
  }
  a:hover {
    box-shadow: 0 2px 0 0 var(--color-primary);
    background-color: hsla(var(--color-primary-hsl), 0.1);
    color: var(--color-neutral-160);
  }
  a:active {
    background-color: hsla(var(--color-primary-hsl), 0.16);
  }
  a:focus-visible {
    box-shadow: 0 0 0 2px var(--color-primary);
  }
</style>
