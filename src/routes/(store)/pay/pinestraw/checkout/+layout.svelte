<script lang="ts">
  import { afterNavigate, invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';
  import { Breadcrumbs } from '$lib/components/ui/breadcrumb';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';

  export let data;

  const balesQuantity = parseInt(data.session['store.pinestraw.checkout.bale_quantity'] || '0');
  const spreadQuantity = parseInt(data.session['store.pinestraw.checkout.spread_quantity'] || '0');

  const balesPrice = data.products?.bale?.price || 0;
  const spreadPrice = data.products?.spread?.price || 0;

  afterNavigate(({ from, to }) => {
    if (!from?.route.id || !to?.route.id) return;

    // if we have navigated here from a child route
    // (likely via breadcrumbs)
    // invalidate this route to prevent stale data
    if (from.route.id.startsWith(to.route.id)) {
      console.log('invalidating');
      invalidateAll();
    }
  });
</script>

<div class="breadcrumbs">
  <Breadcrumbs items={data.session['store.pinestraw.checkout.breadcrumbs']} />
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
          <table>
            <thead>
              <tr>
                <th class="quantity">Quan.</th>
                <th class="description">Description</th>
                <th class="price">Price</th>
              </tr>
            </thead>
            <tbody>
              {#if balesQuantity}
                {#if balesQuantity > 0 && balesPrice}
                  <tr>
                    <td class="quantity">{balesQuantity}</td>
                    <td class="description">PINE STRAW BALE</td>
                    <td class="price">${(balesQuantity * balesPrice).toFixed(2)}</td>
                  </tr>
                {/if}
              {/if}
              {#if spreadQuantity}
                {#if spreadQuantity > 0 && spreadPrice}
                  <tr>
                    <td class="quantity">{spreadQuantity}</td>
                    <td class="description">SPREAD PINE STRAW</td>
                    <td class="price">${(spreadQuantity * spreadPrice).toFixed(2)}</td>
                  </tr>
                {/if}
              {/if}
              <tr></tr>
              <br />
              <tr style="border-top: none;">
                <td class="quantity" style="border-top: none;"></td>
                <td class="description" style="border-top: none; text-align: right;">
                  SUBTOTAL&nbsp;&nbsp;&nbsp;
                </td>
                <td class="price" style="border-top: none;">
                  ${(balesQuantity * balesPrice + spreadQuantity * spreadPrice).toFixed(2)}
                </td>
              </tr>
              <tr style="border-top: none;">
                <td class="quantity" style="border-top: none;"></td>
                <td class="description" style="border-top: none; text-align: right;">
                  TAX&nbsp;&nbsp;&nbsp;
                </td>
                <td class="price" style="border-top: none;"> </td>
              </tr>
              <tr style="border-top: none;">
                <td class="quantity" style="border-top: none;"></td>
                <td class="description" style="border-top: none; text-align: right;">
                  TRANSACT FEE&nbsp;&nbsp;&nbsp;
                </td>
                <td class="price" style="border-top: none;">0</td>
              </tr>
              <tr style="border-top: none;">
                <td class="quantity" style="border-top: none;"></td>
                <td class="description" style="border-top: none; text-align: right;">
                  TOTAL&nbsp;&nbsp;&nbsp;
                </td>
                <td class="price" style="border-top: none;">
                  ${(balesQuantity * balesPrice + spreadQuantity * spreadPrice).toFixed(2)}
                </td>
              </tr>
              <tr style="border-top: none;">
                <td class="quantity" style="border-top: none;"></td>
                <td class="description" style="border-top: none; text-align: right;">
                  CHECK DELAY&nbsp;&nbsp;&nbsp;
                </td>
                <td class="price" style="border-top: none;">
                  ${(balesQuantity * balesPrice + spreadQuantity * spreadPrice).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          <br />
          {#if data.session['store.pinestraw.checkout.name']}
            <div>{data.session['store.pinestraw.checkout.name'].toUpperCase()}</div>
          {/if}
          {#if data.session['store.pinestraw.checkout.email']}
            <div>{data.session['store.pinestraw.checkout.email'].toUpperCase()}</div>
          {/if}
          {#if data.session['store.pinestraw.checkout.phone']}
            <div>{data.session['store.pinestraw.checkout.phone'].toUpperCase()}</div>
          {/if}

          <br />
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
          {'<missing>'}
        </article>
      </CardContent>
    </Card>
  </aside>

  <div>
    {#if $page.form?.error}
      <aside style="margin-bottom: 1rem;">
        <Card
          style="border-color: hsla(var(--destructive) / 50%); background-color: hsla(var(--destructive) / 8%);"
        >
          <CardHeader>
            <CardTitle tag="h1">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              {$page.form?.error}
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
    width: 50px;
    max-width: 50px;
    word-break: break-all;
    text-align: right;
  }
</style>
