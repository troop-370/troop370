<script lang="ts">
  import { applyAction, enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '$lib/components/ui/select';
  import { Markdown } from '$utils';
  import {
    Calendar,
    Coins,
    CreditCard,
    Landmark,
    Leaf,
    Mail,
    MapPin,
    ShoppingBag,
    Truck,
  } from 'lucide-svelte';
  import { pinestrawStore } from './pinestraw.store';

  export let data;

  let aboutSectionInnerHTML = Markdown.parse(data.aboutSectionText || '')[1];

  let balePrice = data.products?.bale?.price || 6.0;
  let spreadingPrice = data.products?.spread?.price || 5.0;

  $: if ($pinestrawStore.spreadingOption?.value === 'yes') {
    $pinestrawStore.deliveryOption = {
      value: 'delivery',
      label: 'Delivery (+$10 for orders under 30 bales)',
    };
  }

  $: price = (() => {
    const cashPrice =
      $pinestrawStore.spreadingOption?.value === 'yes' ? balePrice + spreadingPrice : balePrice;
    if ($pinestrawStore.paymentMethod?.value === 'paypal') {
      return cashPrice * 1.035;
    } else if ($pinestrawStore.paymentMethod?.value === 'venmo') {
      return cashPrice * 1.019;
    } else {
      return cashPrice;
    }
  })();
  $: shippingPrice = (() => {
    const cashPrice = $pinestrawStore.quantity < 30 ? 10 : 0;
    if ($pinestrawStore.paymentMethod?.value === 'paypal') {
      return cashPrice * 1.035;
    } else if ($pinestrawStore.paymentMethod?.value === 'venmo') {
      return cashPrice * 1.019;
    } else {
      return cashPrice;
    }
  })();
  $: total =
    ($pinestrawStore.deliveryOption?.value === 'delivery' ? shippingPrice : 0) +
    $pinestrawStore.quantity * price;

  let addSpreadQuantity = 1;
  let conf = false;
</script>

<svelte:head>
  <title>Pine Straw Fundraiser | BSA Troop 370</title>
</svelte:head>

<div class="banner type">
  <h1>Pine Straw Fundraiser</h1>
  <p style="font-size: 1.125rem; margin-top: 0.75em;">
    Support scouting by purchasing premium long leaf pine straw
  </p>
</div>

<div class="grid">
  <div style="display: flex; flex-direction: column; gap: 1rem;">
    <form
      method="POST"
      action="?/order"
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
          <CardTitle style="font-size: 1.5rem; line-height: 2rem;">Order pine straw</CardTitle>
        </CardHeader>
        <CardContent>
          <img
            src={data.products?.bale?.imageUrl || '/photos/backgrounds/pineneedles_l.jpg'}
            alt="Pine Straw"
            class="thumbnail"
          />
          <div class="unit-price">${price.toFixed(2)} / bale</div>
          <div class="form">
            <div class="quantity">
              <Label for="quantity" style="flex-shrink: 0;">Quantity:</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                bind:value={$pinestrawStore.quantity}
                style="width: 6rem;"
                name="bale_quantity"
              />
            </div>

            <div class="select">
              <Label>Bale Spreading</Label>
              {#if $pinestrawStore.spreadingOption?.value === 'yes'}
                <input
                  type="text"
                  name="spread_quantity"
                  bind:value={$pinestrawStore.quantity}
                  hidden
                />
              {/if}
              <Select bind:selected={$pinestrawStore.spreadingOption}>
                <SelectTrigger>
                  <SelectValue placeholder="Select spreading option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">
                    <div class="select-item">
                      <ShoppingBag class="mr-2 h-4 w-4" />
                      No Spreading
                    </div>
                  </SelectItem>
                  <SelectItem value="yes">
                    <div class="select-item">
                      <Leaf class="mr-2 h-4 w-4" />
                      Spreading (+${spreadingPrice.toFixed(2)}/bale)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="select">
              <Label>Delivery Option</Label>
              {#if $pinestrawStore.spreadingOption?.value === 'yes'}
                <div class="delivery-force-message">
                  <i>Delivery is required when spreading is selected.</i>
                  <br />
                  <span>Selected delivery option:</span>
                  {$pinestrawStore.deliveryOption?.label}
                </div>
              {:else}
                <Select
                  bind:selected={$pinestrawStore.deliveryOption}
                  disabled={$pinestrawStore.spreadingOption?.value === 'yes'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup">
                      <div class="select-item">
                        <MapPin class="mr-2 h-4 w-4" />
                        Pickup
                      </div>
                    </SelectItem>
                    <SelectItem value="delivery">
                      <div class="select-item">
                        <Truck class="mr-2 h-4 w-4" />
                        Delivery (+$10 for orders under 30 bales)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              {/if}
            </div>

            <div class="select">
              <Label>Payment Method</Label>
              <Select bind:selected={$pinestrawStore.paymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paypal">
                    <div class="select-item">
                      <CreditCard class="mr-2 h-4 w-4" />
                      PayPal (+3.5%)
                    </div>
                  </SelectItem>
                  <SelectItem value="venmo">
                    <div class="select-item">
                      <Coins class="mr-2 h-4 w-4" />
                      Venmo (+1.9%)
                    </div>
                  </SelectItem>
                  <SelectItem value="cash">
                    <div class="select-item">
                      <Landmark class="mr-2 h-4 w-4" />
                      Check
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter style="display: flex; justify-content: space-between;">
          <div class="summed-price">
            Total: ${total.toFixed(2)}
          </div>
          <Button type="submit">Proceed to checkout</Button>
        </CardFooter>
      </Card>
    </form>

    <Card>
      <CardHeader>
        <CardTitle>Add spreading later</CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          If you did not order spreading in your order of pine straw bales, you can order it
          separately.
        </p>
      </CardContent>
      <CardFooter style="display: flex; justify-content: space-between;">
        <Dialog.Root>
          <Dialog.Trigger>
            <Button variant="outline">Order spreading</Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <form
              method="POST"
              action="?/spread"
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
              <Dialog.Header>
                <Dialog.Title>Add spreading</Dialog.Title>
                <Dialog.Description>
                  Add spreading service to your existing order of pine straw bales. We cannot spread
                  third-party pine staw.
                </Dialog.Description>
              </Dialog.Header>
              <div style="margin-top: 1rem;">
                <div class="quantity">
                  <Label for="spread_quantity" style="flex-shrink: 0;">Quantity:</Label>
                  <Input
                    id="spread_quantity"
                    type="number"
                    min="1"
                    style="width: 6rem;"
                    name="spread_quantity"
                    bind:value={addSpreadQuantity}
                  />
                </div>

                <div
                  style="display: flex; flex-direction: row; gap: 0.5rem; align-items: center; margin: 1rem 0;"
                >
                  <Checkbox id="conf" name="conf" bind:checked={conf} />
                  <input name="conf" type="hidden" bind:value={conf} />
                  <Label for="conf">I have already ordered pine straw bales from Troop 370.</Label>
                </div>
              </div>
              <Dialog.Footer>
                <Button type="submit">Proceed to checkout</Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Root>
      </CardFooter>
    </Card>
  </div>

  <div style="display: flex; flex-direction: column; gap: 1rem;">
    <Card>
      <CardHeader>
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent>
        <article>
          {@html aboutSectionInnerHTML}
        </article>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Upcoming dates</CardTitle>
      </CardHeader>
      <CardContent>
        <article>
          <ul class="dates">
            <li>
              <Calendar class="mr-2 h-4 w-4" />
              <span>Order Deadline: {data.dates.nextDeadline}</span>
            </li>
            <li>
              <Calendar class="mr-2 h-4 w-4" />
              <span>Delivery/Pickup: {data.dates.nextDelivery}</span>
            </li>
          </ul>
          <p>Order early! Supply is limited, and we often sell out before the order deadline.</p>
        </article>
      </CardContent>
    </Card>
    {#if data.products?.bale || data.products?.spread}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="pricing">
            {#if data.products.bale?.price}
              <li>
                <span>Pine Straw:</span>
                <span class="price-with-unit">
                  <span class="prices">
                    <span class="price-type">Cash</span>
                    <span>${data.products.bale.price.toFixed(2)}</span>
                    <span class="price-type">PayPal</span>
                    <span>${(data.products.bale.price * 1.035).toFixed(2)}</span>
                    <span class="price-type">Venmo</span>
                    <span>${(data.products.bale.price * 1.019).toFixed(2)}</span>
                  </span>
                  <span> / bale</span>
                </span>
              </li>
            {/if}
            {#if data.products.spread?.price}
              <li>
                <span>Bale Spreading:</span>
                <span class="price-with-unit">
                  <span class="prices">
                    <span class="price-type">Cash</span>
                    <span>+${data.products.spread.price.toFixed(2)}</span>
                    <span class="price-type">PayPal</span>
                    <span>+${(data.products.spread.price * 1.035).toFixed(2)}</span>
                    <span class="price-type">Venmo</span>
                    <span>+${(data.products.spread.price * 1.019).toFixed(2)}</span>
                  </span>
                  <span> / bale</span>
                </span>
              </li>
            {/if}
            <li>
              <span>Delivery:</span>
              <span class="price-with-unit">
                <span class="prices">
                  <span class="price-type">30 or more bales</span>
                  <span>FREE DELIVERY</span>
                  <span class="price-type">{'< 30 bales'}</span>
                  <span>$10 flat rate</span>
                </span>
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    {/if}
    <Card>
      <CardHeader>
        <CardTitle>Contact us</CardTitle>
      </CardHeader>
      <CardContent>
        <article>
          <ul class="contact">
            <li>
              <Mail class="mr-2 h-4 w-4" />
              <a href="mailto:pinestraw@troop370atlanta.org">pinestraw@troop370atlanta.org</a>
            </li>
          </ul>
        </article>
      </CardContent>
    </Card>
  </div>
</div>

<div class="mail-form">
  <p>
    If you prefer to mail in your order, please download and complete our printable order form.
    <br />
    <a href={data.orderForm.href}>Order Form – {data.orderForm.note}</a>
  </p>
</div>

<style>
  .banner {
    overflow: hidden;
    position: relative;
    margin-bottom: 1rem;
    background-image: url(../../../photos/backgrounds/pineneedles_l.jpg);
    background-color: #555;
    background-blend-mode: multiply;
    text-align: center;
    color: #ffffff;
    padding: 4rem 1rem;
    border-radius: var(--radius);
    border-width: 1px;
  }

  .grid {
    display: grid;
    gap: 1rem;
  }

  ul.dates,
  ul.pricing,
  ul.contact {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  ul.dates li,
  ul.pricing li,
  ul.contact li {
    display: flex;
    align-items: center;
  }
  ul.pricing li {
    justify-content: space-between;
  }

  @media (min-width: 768px) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .price-with-unit {
    display: flex;
    align-items: start;
    gap: 0.25rem;
    line-height: 1rem;
  }

  .prices {
    display: inline-grid;
    grid-template-columns: auto auto;
    grid-template-rows: auto;
    justify-content: end;
    align-items: end;
    gap: 0.25rem;
  }

  .prices > span:nth-child(2n):not(:nth-child(2)) {
    font-size: 0.8rem;
    line-height: 0.8rem;
    opacity: 0.8;
  }

  .price-type {
    font-size: 0.7rem;
    line-height: 0.7rem;
    opacity: 0.5;
    text-align: right;
  }

  .prices .price:not(:first-child) .price-type {
    margin-top: 3px;
  }

  .thumbnail {
    width: 100%;
    aspect-ratio: 2 / 1;
    overflow: hidden;
    margin-bottom: 1rem;
    border-radius: var(--radius);
    object-fit: cover;
  }

  .unit-price {
    font-size: 1.5rem;
    line-height: 2rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .quantity {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .select > :global(*:not(:first-child)) {
    margin-top: 0.5rem;
  }
  .select-item {
    display: flex;
    align-items: center;
  }

  .summed-price {
    font-size: 1.5rem;
    line-height: 2rem;
    font-weight: 700;
  }

  .mail-form {
    margin-top: 1rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }

  .delivery-force-message {
    font-size: 0.875rem;
    padding-left: 0.875rem;
    height: 40px;
    margin-top: 0;
    margin-bottom: 0.5rem;
  }
  .delivery-force-message span {
    font-weight: 500;
  }
</style>
