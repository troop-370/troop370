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

    <p>
      Before you complete the Venmo payment:
      <br />
      <span>Enable the <strong>Turn on for purchases</strong> option.</span>
      <span>
        The switch should have a
        <img
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAALfSURBVDhPfVNNSFRRFL73/c1MlpZalqOJTqOSQe7KiimiVuFCalMQQpISQX8WoVGOlLYIrTBcGELSIquFRVBBG42wMgMhRZ3RKVMbnci/caaZ9+5P5z5n+nHRB++9e757zjvfuedcjJbBcfVcAWWsjHHu4hwVCA5jNCBh/FqWpNbRy40DpmMMv3+wv6VB8XwbryWcVXLOLTH6H2CMowqWGnLTM2telVcSkxOv4vvN8ief57FOaYmw46CIm1/5Tx4TFll5mp+RdehF2RkiCyK61XnFYPSEWIsQAtqniYFCjM2HOIsEKbFqkowUqEWAcpY/E1xg853vurDz2nnnT0Pvg5pXiO1JIxpFshKqzNk8derAQQq1o+aXT7Q7I/0pQUNfZVctFpEE+LBN1Qpxdu3Zuigl1YL0E4O8OVwxVLgpLyHBaksGKgkegcWIrn//MNQ/52pv2bJB1VSRDEqpl0B6kfBgQjxnxJGemQrB2UDFg1Gfz7tSJ0a2MyNrHfjQpZNBSMRKGOGNwjAPihh4MRwKCLvHM4hmF4Poee9b1NHbjVRFRaFIOIAowZJwAIhYWHMas4GRLJBN2DRq6Kj0XhPyBfyouuQIsmka6/UMQoz0V4s5lRP3bCsGSQ5hEjjpL1MT+tGi3TM569OTXY585CooRBZVRRFD91Y8bF09y3miNdYNmIuPEkxXl2kBkiUJdS/MZDV2PAhDV/z2lLVIUxREGJ2se9QW7QnO2deATxwiVk7bt2ucMHYMVJjSkmQFdUz40ia9w/6c1LSx6dkfgar2VkvTSH9uhmaNjZbZxgWbop40tUArq6CV9eYOwJwHCpOqR3VztDSrZocfx4MFoIXVn2tuXl8qBrDRfboFlByPmf+FIkl3v7pvl4u1OcoC853vn6Xs3alzxLeLnIKLZ4xnAdkhVVbcY+5bF2PUslsCyKu74DAoKYWLtUPG2Ck4yrlXk+VuCG4bvnRj1HQ0gdAvSmo1IDtjQ0UAAAAASUVORK5CYII="
          alt=""
        /> green shield when enabled.
      </span>
      <span>Per the Venmo User Agreement, we are required to have this option enabled.</span>
    </p>

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

  span {
    margin-left: 20px;
    display: block;
  }
</style>
