<script lang="ts">
  import { browser } from '$app/environment';
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';

  export let data;
  let conf1 = $page.form?.data?.conf1 || data.session['store.pinestraw.checkout.conf1'] || false;
  let conf2 = $page.form?.data?.conf2 || data.session['store.pinestraw.checkout.conf2'] || false;
  let conf3 = $page.form?.data?.conf3 || data.session['store.pinestraw.checkout.conf3'] || false;
  let name = $page.form?.data?.name || data.session['store.pinestraw.checkout.name'] || '';
  let phone = $page.form?.data?.phone || data.session['store.pinestraw.checkout.phone'] || '';
</script>

<form method="POST" use:enhance>
  <Card>
    <CardHeader>
      <CardTitle style="font-size: 1.5rem; line-height: 2rem;" tag="h1">Pickup</CardTitle>
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
        You must bring a vehicle that can accommodate the number of bales you ordered. Bring a copy
        of your order confirmation or receipt.
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
            Yes, I or my representative will be able to pick up my order at the designated time and
            address.
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
        <Input id="phone" name="phone" type="phone" bind:value={phone} />
      </div>
    </CardContent>
    <CardFooter style="display: flex; justify-content: space-between;">
      <Button type="submit" disabled={browser && (!conf1 || !conf2 || !conf3 || !name || !phone)}>
        Continue
      </Button>
    </CardFooter>
  </Card>
</form>
