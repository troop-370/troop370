<script lang="ts">
  import { page } from '$app/stores';
  import Button from '@smui/button';
  import PayWithVenmo from './PayWithVenmo.svelte';

  $: payload = $page.form?.payload;
  $: orderId = payload?.cart?.order?.id;
  $: amount = payload?.cart?.order?.total;

  let venmoLinkUsed = false;
</script>

<h1>Pay with Venmo</h1>

{#if !orderId || !amount}
  <div class="instruction">
    <p>Order ID or total amount is missing.</p>
    <p>Return to the previous page and try again.</p>
  </div>
{:else}
  <div class="instruction">
    <p>Click the <b>Pay with Venmo</b> button below to pay for your order.</p>

    <p>Once you finish paying, return to this page and click or tap <b>Complete Order</b>.</p>
  </div>

  <div class="buttons">
    <PayWithVenmo {orderId} {amount} bind:venmoLinkUsed />

    <form method="POST">
      <Button variant="unelevated" disabled={!venmoLinkUsed}>Complete order</Button>
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
</style>
