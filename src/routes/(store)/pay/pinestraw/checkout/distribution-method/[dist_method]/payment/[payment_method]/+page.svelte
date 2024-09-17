<script lang="ts">
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

  let name =
    $page.form?.data?.name ||
    data.session['store.pinestraw.checkout.billing.name'] ||
    data.session['store.pinestraw.checkout.name'] ||
    '';
  let phone =
    $page.form?.data?.phone ||
    data.session['store.pinestraw.checkout.billing.phone'] ||
    data.session['store.pinestraw.checkout.phone'] ||
    '';
  let streetAddress =
    $page.form?.data?.street_address ||
    data.session['store.pinestraw.checkout.billing.street_address'] ||
    data.session['store.pinestraw.checkout.street_address'];
  ('');
  let city =
    $page.form?.data?.city ||
    data.session['store.pinestraw.checkout.billing.city'] ||
    data.session['store.pinestraw.checkout.city'] ||
    '';
  let state =
    $page.form?.data?.state ||
    data.session['store.pinestraw.checkout.billing.state'] ||
    data.session['store.pinestraw.checkout.state'] ||
    '';
  let postalCode =
    $page.form?.data?.postal_code ||
    data.session['store.pinestraw.checkout.billing.postal_code'] ||
    data.session['store.pinestraw.checkout.postal_code'] ||
    '';
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
      <PayWithVenmo {amount} {orderId} bind:venmoLinkUsed />
      <p>
        <strong>Important:</strong> Please make sure you complete the Venmo payment before submitting
        your order.
      </p>
    {/if}

    {#if data.paymentMethod.paymentProcessorId === 'paypalStandard'}
      <PayPal {data} />
    {/if}

    <section>
      <CardTitle tag="h2" style="margin-bottom: 0.5rem;">Billing details</CardTitle>

      <div class="input">
        <Label for="name">First and last name</Label>
        <Input id="name" name="name" bind:value={name} />
      </div>

      <div class="input">
        <Label for="phone">Phone number</Label>
        <Input id="phone" name="phone" type="tel" bind:value={phone} />
      </div>

      <div class="input">
        <Label for="street-address">Address</Label>
        <Input id="street-address" name="street_address" type="text" bind:value={streetAddress} />
      </div>

      <div class="input">
        <Label for="city">City</Label>
        <Input id="city" name="city" type="text" bind:value={city} />
      </div>

      <div class="input">
        <Label for="postal-code">ZIP or ZIP+4</Label>
        <Input id="postal-code" name="postal_code" type="text" bind:value={postalCode} />
      </div>

      <div class="input">
        <Label for="state">State</Label>
        <select id="state" name="state" bind:value={state} autocomplete="address-level1">
          {#each usStatesAndTerritories.sort((a, b) => (a === 'Georgia (GA)' ? -1 : 0)) as usState}
            <option value={usState.slice(-3, -1)}>{usState.slice(0, -5)}</option>
          {/each}
        </select>
      </div>
    </section>
  </CardContent>
  <CardFooter style="display: flex; justify-content: space-between;">
    <Button type="button" variant="outline" href={data.breadcrumbs.slice(-2)[0].href}>Back</Button>
    {#if data.paymentMethod?.paymentProcessorId === 'offline'}
      <Button
        type="submit"
        disabled={(isVenmo && !venmoLinkUsed) || !streetAddress || !city || !postalCode}
      >
        Submit order
      </Button>
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
