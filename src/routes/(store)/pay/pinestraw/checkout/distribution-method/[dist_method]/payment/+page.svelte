<script lang="ts">
  import { browser } from '$app/environment';
  import { applyAction, enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Label } from '$lib/components/ui/label';
  import * as RadioGroup from '$lib/components/ui/radio-group';

  export let data;
  let paymentMethod =
    data.session['store.pinestraw.checkout.payment_method'] ||
    $page.form?.data?.payment_method ||
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
    <CardTitle style="font-size: 1.5rem; line-height: 2rem;" tag="h1">Payment method</CardTitle>
  </CardHeader>
  <CardContent>
    <div class="input">
      <Label>Choose a payment method</Label>
      <RadioGroup.Root>
        {#each data.availablePaymentMethods as method}
          <div class="radio-group">
            <input
              type="radio"
              name="payment_method"
              id={`option-${method.id}`}
              value={method.id}
              bind:group={paymentMethod}
            />
            <Label for={`option-${method.id}`}>{method.checkoutTitleLong}</Label>
          </div>
        {/each}
      </RadioGroup.Root>
    </div>
  </CardContent>
  <CardFooter style="display: flex; justify-content: space-between;">
    <Button type="button" variant="outline" href={data.breadcrumbs.slice(-2)[0].href}>Back</Button>
    <Button type="submit" disabled={browser && !paymentMethod}>Continue</Button>
  </CardFooter>
</form>
