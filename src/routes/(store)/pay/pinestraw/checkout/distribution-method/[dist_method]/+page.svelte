<script lang="ts">
  import { browser } from '$app/environment';
  import { applyAction, enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { usStatesAndTerritories } from '$utils/usStatesAndTerritories.js';

  export let data;

  const isBuyingSpreading =
    parseInt(data.session['store.pinestraw.checkout.spread_quantity'] || '0') > 0;

  let conf1 = $page.form?.data?.conf1 || data.session['store.pinestraw.checkout.conf1'] || false;
  let conf2 = $page.form?.data?.conf2 || data.session['store.pinestraw.checkout.conf2'] || false;
  let conf3 = $page.form?.data?.conf3 || data.session['store.pinestraw.checkout.conf3'] || false;
  let name = $page.form?.data?.name || data.session['store.pinestraw.checkout.name'] || '';
  let phone = $page.form?.data?.phone || data.session['store.pinestraw.checkout.phone'] || '';
  let streetAddress =
    $page.form?.data?.street_address ||
    data.session['store.pinestraw.checkout.street_address'] ||
    '';
  let city = $page.form?.data?.city || data.session['store.pinestraw.checkout.city'] || '';
  let state = $page.form?.data?.state || data.session['store.pinestraw.checkout.state'] || '';
  let postalCode =
    $page.form?.data?.postal_code || data.session['store.pinestraw.checkout.postal_code'] || '';
  let deliverLocation =
    $page.form?.data?.deliver_location ||
    data.session['store.pinestraw.checkout.deliver_location'] ||
    '';
  let spreadLocation =
    $page.form?.data?.spread_location ||
    data.session['store.pinestraw.checkout.spread_location'] ||
    '';
  let specialInstructions =
    $page.form?.data?.special_instructions ||
    data.session['store.pinestraw.checkout.special_instructions'] ||
    '';
</script>

<Card>
  {#if data.distributionMethod.isPickup}
    <form
      method="POST"
      action="?/pickup"
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
          Pickup on {data.dates.nextDelivery}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardTitle tag="h2">Confirmation</CardTitle>

        <p>
          Pickup will be between 9:00 AM and 12:00 PM on {data.dates.nextDelivery} at St. James UMC (Peachtree-Dunwood
          Road parking lot).
          <br />
          <a
            href="https://www.google.com/maps/dir//33.8750142,-84.3581275/@33.8748033,-84.3583349,20.75z/data=!4m2!4m1!3e0"
            target="_blank"
            rel="noopener noreferrer"
          >
            View directions on map
          </a>
        </p>

        <p>
          You must bring a vehicle that can accommodate the number of bales you ordered. Bring a
          copy of your order confirmation or receipt.
        </p>

        <div class="checkbox-group">
          <Label>
            Do you confirm that you or your representative can pick up your ordered bales at the
            designated time and address?
          </Label>
          <div class="checkbox">
            <Checkbox id="conf1" name="conf1" bind:checked={conf1} />
            <input name="conf1" bind:value={conf1} type="hidden" />
            <Label for="conf1">
              Yes, I or my representative will be able to pick up my order at the designated time
              and address.
            </Label>
          </div>
          <div class="checkbox">
            <Checkbox id="conf2" name="conf2" bind:checked={conf2} />
            <input name="conf2" bind:value={conf2} type="hidden" />
            <Label for="conf2">
              I or my representative will bring a vehicle that can accommodate the number of bales I
              ordered.
            </Label>
          </div>
          <div class="checkbox">
            <Checkbox id="conf3" name="conf3" bind:checked={conf3} />
            <input name="conf3" bind:value={conf3} type="hidden" />
            <Label for="conf3">
              I or my representative will bring a copy of the order confirmation or receipt.
            </Label>
          </div>
        </div>

        <CardTitle style="margin: 1.5rem 0 0.5rem 0;" tag="h2">Contact information</CardTitle>

        <div class="input">
          <Label for="name">First and last name</Label>
          <Input id="name" name="name" bind:value={name} />
        </div>

        <div class="input">
          <Label for="phone">Phone number</Label>
          <Input id="phone" name="phone" type="tel" bind:value={phone} />
        </div>
      </CardContent>
      <CardFooter style="display: flex; justify-content: space-between;">
        <Button type="submit" disabled={browser && (!conf1 || !conf2 || !conf3 || !name || !phone)}>
          Continue
        </Button>
      </CardFooter>
    </form>
  {:else}
    <form
      method="POST"
      action="?/delivery"
      use:enhance={({ formElement, formData, action, cancel }) => {
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
          Delivery on {data.dates.nextDelivery}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          You must be within our delivery area in order to choose this option. If you are not within
          a reasonable distance of <a
            href="https://www.google.com/maps/dir//33.8750142,-84.3581275/@33.8748033,-84.3583349,20.75z/data=!4m2!4m1!3e0"
            target="_blank"
            rel="noopener noreferrer"
          >
            St. James UMC</a
          >, please choose the pickup option.
        </p>

        <CardTitle style="margin: 1.5rem 0 0.5rem 0;" tag="h2">Contact information</CardTitle>

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
          <Label for="state">State</Label>
          <select id="state" name="state" bind:value={state} autocomplete="address-level1">
            {#each usStatesAndTerritories.sort( (a, b) => (a === 'Georgia (GA)' ? -1 : 0) ) as usState}
              <option value={usState.slice(-3, -1)}>{usState.slice(0, -5)}</option>
            {/each}
          </select>
        </div>

        <div class="input">
          <Label for="postal-code">ZIP or ZIP+4</Label>
          <Input id="postal-code" name="postal_code" type="text" bind:value={postalCode} />
        </div>

        <CardTitle style="margin: 1.5rem 0 0.5rem 0;" tag="h2">
          {#if isBuyingSpreading}
            Delivery and spreading details
          {:else}
            Delivery details
          {/if}
        </CardTitle>

        <div class="input">
          <Label for="deliver-location">
            Where in your yard should we stack the pine straw
            {#if isBuyingSpreading}
              bales prior to spreading?
            {:else}
              bales?
            {/if}
          </Label>
          <Input
            id="deliver-location"
            name="deliver_location"
            type="text"
            bind:value={deliverLocation}
          />
        </div>

        {#if isBuyingSpreading}
          <div class="input">
            <Label for="spread-location">Where should the pine straw be spread?</Label>
            <Input
              id="spread-location"
              name="spread_location"
              type="text"
              bind:value={spreadLocation}
            />
          </div>
        {/if}

        <div class="input">
          <Label for="special_instructions">
            Is there anything else we should know? (e.g., gate code) (optional)
          </Label>
          <Input
            id="special_instructions"
            name="special_instructions"
            type="text"
            bind:value={specialInstructions}
          />
        </div>
      </CardContent>
      <CardFooter style="display: flex; justify-content: space-between;">
        <Button
          type="submit"
          disabled={browser &&
            (!streetAddress ||
              !city ||
              !state ||
              !postalCode ||
              !name ||
              !phone ||
              !deliverLocation ||
              (isBuyingSpreading && !spreadLocation))}
        >
          Continue
        </Button>
      </CardFooter>
    </form>
  {/if}
</Card>
