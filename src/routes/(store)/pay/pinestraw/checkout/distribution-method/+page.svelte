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

  let shippingMethod =
    $page.form?.data.shipping_method || data.orderDetails.shippingOption?.shippingMethodId || '';
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
  <Card>
    <CardHeader>
      <CardTitle style="font-size: 1.5rem; line-height: 2rem;" tag="h1">
        Delivery or pick-up
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="input">
        <Label>Choose an option</Label>
        <RadioGroup.Root>
          {#each (data.orderDetails.availableShippingOptions || [])
            .filter((method) => !!method.shippingMethodName)
            .sort((a, b) => (a.isPickup ? 1 : -1))
            .sort((a, b) => a.shippingMethodName?.localeCompare(b.shippingMethodId) || 0) as method}
            <div class="radio-group">
              <input
                type="radio"
                name="shipping_method"
                id={`option-${method.shippingMethodId}`}
                value={method.shippingMethodId}
                bind:group={shippingMethod}
              />
              <Label for={`option-${method.shippingMethodId}`}>{method.shippingMethodName}</Label>
            </div>
          {/each}
        </RadioGroup.Root>
      </div>
    </CardContent>
    <CardFooter style="display: flex; justify-content: space-between;">
      <Button type="submit" disabled={browser && !shippingMethod}>Continue</Button>
    </CardFooter>
  </Card>
</form>
