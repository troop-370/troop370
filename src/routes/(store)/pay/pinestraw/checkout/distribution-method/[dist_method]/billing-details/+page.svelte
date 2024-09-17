<script lang="ts">
  import { browser } from '$app/environment';
  import { applyAction, enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';
  import { CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { usStatesAndTerritories } from '$utils/usStatesAndTerritories';
  import type { PageData } from './$types';

  export let data: PageData;

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
    <CardTitle style="font-size: 1.5rem; line-height: 2rem;" tag="h1">Billing details</CardTitle>
  </CardHeader>
  <CardContent>
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
  </CardContent>
  <CardFooter style="display: flex; justify-content: space-between;">
    <Button type="button" variant="outline" href={data.breadcrumbs.slice(-2)[0].href}>Back</Button>
    <Button type="submit" disabled={browser && (!streetAddress || !city || !postalCode)}>
      Continue
    </Button>
  </CardFooter>
</form>
