<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { Breadcrumbs } from '$lib/components/ui/breadcrumb';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { error } from '@sveltejs/kit';

  export let data;

  const balesQuantity = parseInt(data.session['store.pinestraw.checkout.bale_quantity'] || '0');
  const spreadQuantity = parseInt(data.session['store.pinestraw.checkout.spread_quantity'] || '0');

  const balesPrice = data.products?.bale?.price || 0;
  const spreadPrice = data.products?.spread?.price || 0;

  // $: browser && console.log('checkout', data.orderDetails);
</script>

<div class="breadcrumbs">
  <Breadcrumbs items={$page.data.breadcrumbs} />
</div>

<div class="grid">
  <aside class="left">
    <Card>
      <CardHeader>
        <CardTitle tag="h1">Your order</CardTitle>
      </CardHeader>
      <CardContent>
        <article class="receipt">
          <div class="centered">TROOP 370 STORE</div>
          <div class="centered">Pine Straw Fundraiser</div>
          <br />
          <div class="centered">ORDER</div>
          <br />
          {#if data.orderDetails}
            {@const orderDetails = data.orderDetails}
            <table>
              <thead>
                <tr>
                  <th class="quantity">Quan.</th>
                  <th class="description">Description</th>
                  <th class="price">Price</th>
                </tr>
              </thead>
              <tbody>
                {#each orderDetails.items || [] as item}
                  <tr>
                    <td class="quantity">{item.quantity || 0}</td>
                    <td class="description">{item.name?.toUpperCase()}</td>
                    <td class="price">${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
                  </tr>
                {/each}
                <tr></tr>
                <br />
                {#if orderDetails.subtotal}
                  <tr style="border-top: none;">
                    <td class="quantity" style="border-top: none;"></td>
                    <td class="description" style="border-top: none; text-align: right;">
                      SUBTOTAL&nbsp;&nbsp;&nbsp;
                    </td>
                    <td class="price" style="border-top: none;">
                      ${orderDetails.subtotal.toFixed(2)}
                    </td>
                  </tr>
                {/if}
                {#if orderDetails.shippingOption?.shippingRate}
                  <tr style="border-top: none;">
                    <td class="quantity" style="border-top: none;"></td>
                    <td class="description" style="border-top: none; text-align: right;">
                      DELIVERY FEE&nbsp;&nbsp;&nbsp;
                    </td>
                    <td class="price" style="border-top: none;">
                      ${orderDetails.shippingOption.shippingRate.toFixed(2)}
                    </td>
                  </tr>
                {/if}
                {#if orderDetails.customSurcharges}
                  {#each orderDetails.customSurcharges as surcharge}
                    <tr style="border-top: none;">
                      <td class="quantity" style="border-top: none;"></td>
                      <td class="description" style="border-top: none; text-align: right;">
                        {surcharge.id?.toUpperCase()}&nbsp;&nbsp;&nbsp;
                      </td>
                      <td class="price" style="border-top: none;">
                        {#if surcharge.type === 'PERCENT'}
                          {((orderDetails.subtotal || 0) * ((surcharge.value || 0) * 0.01)).toFixed(
                            2
                          )}
                        {:else}
                          {surcharge.value.toFixed(2)}
                        {/if}
                      </td>
                    </tr>
                  {/each}
                {/if}
                {#if orderDetails.discountInfo}
                  {#each orderDetails.discountInfo as discount}
                    <tr style="border-top: none;">
                      <td class="quantity" style="border-top: none;"></td>
                      <td class="description" style="border-top: none; text-align: right;">
                        {discount.description?.toUpperCase()}&nbsp;&nbsp;&nbsp;
                      </td>
                      <td class="price" style="border-top: none;">
                        {#if discount.type === 'PERCENT'}
                          (${(
                            (orderDetails.subtotal || 0) *
                            ((discount.value || 0) * 0.01)
                          ).toFixed(2)})
                        {:else}
                          (${discount.value?.toFixed(2)})
                        {/if}
                      </td>
                    </tr>
                  {/each}
                {/if}
                {#if orderDetails.tax}
                  <tr style="border-top: none;">
                    <td class="quantity" style="border-top: none;"></td>
                    <td class="description" style="border-top: none; text-align: right;">
                      TAX&nbsp;&nbsp;&nbsp;
                    </td>
                    <td class="price" style="border-top: none;">${orderDetails.tax.toFixed(2)}</td>
                  </tr>
                {/if}
                {#if orderDetails.total}
                  <tr style="border-top: none;">
                    <td class="quantity" style="border-top: none;"></td>
                    <td class="description" style="border-top: none; text-align: right;">
                      TOTAL&nbsp;&nbsp;&nbsp;
                    </td>
                    <td class="price" style="border-top: none;">${orderDetails.total.toFixed(2)}</td
                    >
                  </tr>
                {/if}
              </tbody>
            </table>

            <br />

            {#if orderDetails.billingPerson}
              <b>Billing Details</b>
              {#if orderDetails.billingPerson.name}
                <div>{orderDetails.billingPerson.name.toUpperCase()}</div>
              {/if}
              {#if orderDetails.billingPerson.phone}
                <div>{orderDetails.billingPerson.phone}</div>
              {/if}
            {/if}
            {#if orderDetails.email}
              <div>{orderDetails.email.toUpperCase()}</div>
            {/if}
            {#if orderDetails.billingPerson}
              {#if orderDetails.billingPerson.street}
                <div>{orderDetails.billingPerson.street}</div>
              {/if}
              {#if orderDetails.billingPerson.city}
                <div>
                  {orderDetails.billingPerson.city}
                  {#if orderDetails.billingPerson.stateOrProvinceName}
                    <span>{orderDetails.billingPerson.stateOrProvinceName}</span>
                  {/if}
                  {#if orderDetails.billingPerson.postalCode}
                    <span>{orderDetails.billingPerson.postalCode}</span>
                  {/if}
                </div>
              {/if}
            {/if}

            <br />

            {#if orderDetails.shippingPerson}
              <b>Shipping Details</b>
              {#if orderDetails.shippingPerson.name}
                <div>{orderDetails.shippingPerson.name.toUpperCase()}</div>
              {/if}
              {#if orderDetails.shippingPerson.phone}
                <div>{orderDetails.shippingPerson.phone}</div>
              {/if}
            {/if}
            {#if orderDetails.email}
              <div>{orderDetails.email.toUpperCase()}</div>
            {/if}
            {#if orderDetails.shippingPerson}
              {#if orderDetails.shippingPerson.street}
                <div>{orderDetails.shippingPerson.street}</div>
              {/if}
              {#if orderDetails.shippingPerson.city}
                <div>
                  {orderDetails.shippingPerson.city}
                  {#if orderDetails.shippingPerson.stateOrProvinceName}
                    <span>{orderDetails.shippingPerson.stateOrProvinceName}</span>
                  {/if}
                  {#if orderDetails.shippingPerson.postalCode}
                    <span>{orderDetails.shippingPerson.postalCode}</span>
                  {/if}
                </div>
              {/if}
            {/if}

            <br />
          {:else}
            {'<incomplete>'}
          {/if}

          <!-- <br />
          <b>PICKUP DATE</b>
          <br />
          {data.dates.nextDelivery.toUpperCase()}

          <br />
          <br />
          <b>SHIP DATE</b>
          <br />
          {data.dates.nextDelivery.toUpperCase()}

          <br />
          <br />
          <b>SHIP ADDRESS</b>
          <br />
          {'<missing>'} -->
        </article>
      </CardContent>
    </Card>
  </aside>

  <div>
    {#if $page.form?.error || data.hasOrderUpdateError}
      <aside style="margin-bottom: 1rem;">
        <Card
          style="border-color: hsla(var(--destructive) / 50%); background-color: hsla(var(--destructive) / 8%);"
        >
          <CardHeader>
            <CardTitle tag="h1">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              {#if data.hasOrderUpdateError}
                There was an error updating your order. Please try again. If you continue to see
                this error, please contact pinestraw@troop370atlanta.org.
              {:else}
                {$page.form?.error}
              {/if}
            </p>
          </CardContent>
        </Card>
      </aside>
    {/if}

    <slot></slot>
  </div>
</div>

<style>
  .breadcrumbs {
    margin-bottom: 1rem;
  }

  .grid {
    display: grid;
    grid-template-columns: 20rem 3fr;
    gap: 1rem;
  }

  @media (max-width: 768px) {
    .grid {
      grid-template-columns: 1fr;
    }

    .grid > div {
      order: -1;
    }
  }

  article.receipt {
    border: 1px solid gray;
    padding: 8px 10px;
    font-size: 13px;
    line-height: 13px;
    font-family: monospace;
    width: 268px;
  }

  .receipt .centered {
    text-align: center;
  }

  td,
  th,
  tr,
  table {
    border-top: 1px solid black;
    border-collapse: collapse;
  }

  td.description,
  th.description {
    width: 140px;
    max-width: 140px;
  }

  td.quantity,
  th.quantity {
    width: 40px;
    max-width: 40px;
    word-break: break-all;
  }

  td.price,
  th.price {
    width: 60px;
    max-width: 60px;
    word-break: break-all;
    text-align: right;
  }
</style>
