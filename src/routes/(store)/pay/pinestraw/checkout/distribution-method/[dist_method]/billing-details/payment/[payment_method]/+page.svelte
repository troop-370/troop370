<script lang="ts">
  import { browser } from '$app/environment';
  import { applyAction, enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { usStatesAndTerritories } from '$utils/usStatesAndTerritories';
  import type { PageData } from './$types';
  import PayPal from './PayPal.svelte';
  import PayWithVenmo from './PayWithVenmo.svelte';

  export let data: PageData;

  const orderId = data.session['store.pinestraw.checkout.orderId'] || '';
  const amount = data.orderDetails.total || 999999;

  const isVenmo = data.paymentMethod.id === data.venmoPaymentMethodId;
  let venmoLinkUsed = false;

  $: instructions = (() => {
    let instructions = '';
    if (data.paymentMethod.instructionsForCustomer.instructions) {
      instructions = data.paymentMethod.instructionsForCustomer.instructions;
    }
    if (instructions) {
      instructions = instructions.replaceAll('${order.total}', `$${amount?.toFixed(2)}`);
      instructions = instructions.replaceAll('<@orderLink/>', orderId);
    }
    return instructions;
  })();
</script>

<form
  method="POST"
  use:enhance={() => {
    return async ({ result }) => {
      if (result.type === 'redirect') {
        goto(result.location);
      } else {
        await applyAction(result);
      }
    };
  }}
>
  <CardHeader>
    <CardTitle style="font-size: 1.5rem; line-height: 2rem;" tag="h1">
      Pay with {data.paymentMethod.checkoutTitle}
    </CardTitle>
  </CardHeader>
  <CardContent>
    {#if instructions}
      <section>
        <CardTitle tag="h2">Payment instructions</CardTitle>
        {@html instructions}
      </section>
    {/if}

    {#if isVenmo}
      <section>
        <CardTitle tag="h2" style="margin-bottom: 1rem;">Pay</CardTitle>
        <PayWithVenmo {amount} {orderId} bind:venmoLinkUsed />
        <p>
          <strong>Important:</strong> Please make sure you complete the Venmo payment before submitting
          your order.
        </p>
      </section>
    {/if}

    {#if data.paymentMethod.paymentProcessorId === 'paypalStandard'}
      <PayPal {data} />
    {/if}
  </CardContent>
  <CardFooter style="display: flex; justify-content: space-between;">
    <Button type="button" variant="outline" href={data.breadcrumbs.slice(-2)[0].href}>Back</Button>
    {#if data.paymentMethod?.paymentProcessorId === 'offline'}
      <Button type="submit" disabled={browser && isVenmo && !venmoLinkUsed}>Submit order</Button>
    {/if}
  </CardFooter>
</form>

<style>
  section:not(:last-child) {
    margin-bottom: 1.5rem;
  }
  section:not(:first-child) {
    margin-top: 1.5rem;
  }

  section :global(img) {
    display: inline;
  }

  section :global(ol),
  section :global(ul) {
    padding-left: 1.5rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
  section :global(ol) {
    list-style-type: decimal;
  }
  section :global(ul) {
    list-style-type: disc;
  }

  section :global(code) {
    background-color: hsla(0, 0%, 0%, 0.1);
    padding: 0.1rem 0.3rem;
    border-radius: var(--radius);
  }

  section :global(li.highlight) {
    background-color: rgba(255, 183, 0, 0.139);
    border-width: 1px;
    border-color: rgba(255, 183, 0, 0.591);
    padding: 0.25rem;
    border-radius: var(--radius);
  }

  section :global(address) {
    padding-left: 1.5rem;
  }

  section :global(img) {
    height: auto !important;
    max-width: 100%;
  }
</style>
