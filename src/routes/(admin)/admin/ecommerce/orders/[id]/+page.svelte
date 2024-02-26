<script lang="ts">
  import { invalidate } from '$app/navigation';
  import { page } from '$app/stores';
  import FieldWrapper from '$components/admin/FieldWrapper.svelte';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { capitalize, formatISODate, openWindow } from '$utils';
  import { Button, MenuFlyout, MenuFlyoutItem, ProgressRing, TextBlock } from 'fluent-svelte';
  import type { z } from 'zod';
  import type { orderEntrySchema } from '../../ecwidSchemas.js';

  export let data;

  let paymentStatusDropdownOpen = false;
  let fulfillmentStatusDropdownOpen = false;

  let paymentStatusLoading = false;
  $: loading = paymentStatusLoading;

  const paymentStatuses = [
    'AWAITING_PAYMENT',
    'PAID',
    'CANCELLED',
    'REFUNDED',
    'PARTIALLY_REFUNDED',
    'INCOMPLETE',
  ] as const;

  async function updatePaymentStatus(newPaymentStatus: (typeof paymentStatuses)[number]) {
    if (newPaymentStatus === data.order.paymentStatus) return;

    paymentStatusLoading = true;

    const orderUpdate = {
      id: data.order.id,
      paymentStatus: newPaymentStatus,
    } satisfies z.infer<typeof orderEntrySchema>;

    await fetch('', { method: 'PATCH', body: JSON.stringify(orderUpdate) }).then(async () => {
      await invalidate('order-page');
    });

    paymentStatusLoading = false;
  }
</script>

<div class="page-title">
  <TextBlock variant="title">Order #{data.order.id}</TextBlock>
  <Button
    on:click={() => {
      openWindow(
        `https://my.ecwid.com/store/18291121#order:id=${$page.params.id}`,
        'ecwid-order',
        'location=no'
      );
    }}
  >
    <FluentIcon name="Open16Regular" mode="buttonIconLeft" />
    Open in Ecwid
  </Button>
</div>

<article>
  <div>
    <div class="card">
      <TextBlock variant="subtitle" class="card-header">
        ${(data.order.total || 0).toFixed(2)}
        {#if data.order.createDate}
          –
          {formatISODate(data.order.createDate.toISOString(), false, true, true)}
        {/if}
      </TextBlock>
      <div class="main-statuses">
        <FieldWrapper label="Payment status" forId="paymentStatus">
          <div style="display: flex;">
            <MenuFlyout alignment="start" placement="bottom" bind:open={paymentStatusDropdownOpen}>
              <svelte:fragment slot="flyout">
                {#each paymentStatuses as status}
                  <MenuFlyoutItem
                    selected={data.order.paymentStatus === status}
                    disabled={status === 'INCOMPLETE'}
                    on:click={() => updatePaymentStatus(status)}
                  >
                    {capitalize(status.toLowerCase().replaceAll('_', ' '))}
                  </MenuFlyoutItem>
                {/each}
              </svelte:fragment>
            </MenuFlyout>
            <Button
              style="width: fit-content;"
              on:click={() => (paymentStatusDropdownOpen = !paymentStatusDropdownOpen)}
              disabled={loading}
            >
              {#if paymentStatusLoading}
                <ProgressRing
                  style="--fds-accent-default: currentColor; position: absolute;"
                  size={16}
                />
              {/if}
              <div
                style="display: flex; visibility: {paymentStatusLoading ? 'hidden' : 'visible'};"
              >
                {capitalize(data.order.paymentStatus?.toLowerCase() || '').replaceAll('_', ' ')}
                <FluentIcon name="ChevronDown16Regular" mode="buttonIconRight" />
              </div>
            </Button>
          </div>
        </FieldWrapper>
        <FieldWrapper label="Fulfillment status" forId="fulfillmentStatus">
          <div style="display: flex;">
            <MenuFlyout
              alignment="start"
              placement="bottom"
              bind:open={fulfillmentStatusDropdownOpen}
            >
              <svelte:fragment slot="flyout">
                <MenuFlyoutItem>Awaiting processing</MenuFlyoutItem>
                <MenuFlyoutItem>Processing</MenuFlyoutItem>
                <MenuFlyoutItem>Ready for pickup</MenuFlyoutItem>
                <MenuFlyoutItem>Shipped</MenuFlyoutItem>
                <MenuFlyoutItem>Delivered</MenuFlyoutItem>
                <MenuFlyoutItem>Delivery cancelled</MenuFlyoutItem>
                <MenuFlyoutItem>Returned</MenuFlyoutItem>
              </svelte:fragment>
            </MenuFlyout>
            <Button
              style="width: fit-content;"
              disabled
              on:click={() => (fulfillmentStatusDropdownOpen = !fulfillmentStatusDropdownOpen)}
            >
              {capitalize(data.order.fulfillmentStatus?.toLowerCase().replaceAll('_', ' ') || '')}
              <FluentIcon name="ChevronDown16Regular" mode="buttonIconRight" />
            </Button>
          </div>
        </FieldWrapper>
      </div>
    </div>

    <div class="card">
      <TextBlock variant="subtitle" class="card-header">Order items</TextBlock>
      {#each data.order.items || [] as item}
        <div class="item">
          <img src={item.imageUrl} alt="" />
          <div>
            <TextBlock variant="bodyStrong">{item.name}</TextBlock>
            <div style="margin-bottom: 6px;" class="lesser">
              <TextBlock>SKU: {item.sku}</TextBlock>
            </div>
            {#each item.selectedOptions || [] as opt}
              <div>
                <TextBlock>{opt.name}:</TextBlock>
                <TextBlock style="display: block; margin-left: 30px;">
                  {opt.value || '<no value>'}
                  <Button variant="hyperlink" disabled>Edit</Button>
                </TextBlock>
              </div>
            {/each}
          </div>
          <div style="text-align: right;">
            <div>
              <TextBlock variant="bodyStrong">
                ${((item.quantity || 0) * (item.price || 0)).toFixed(2)}
              </TextBlock>
            </div>
            <div class="lesser">
              <TextBlock>{item.quantity}</TextBlock>
              ·
              <TextBlock>${item.price?.toFixed(2)}</TextBlock>
            </div>
          </div>
        </div>
      {/each}
      <table class="total">
        <tr>
          <td>Items</td>
          <td>${(data.order.subtotal || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Shipping</td>
          <td>${(data.order.shippingOption?.shippingRate || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td><TextBlock variant="bodyLarge" style="font-weight: 500;">Total</TextBlock></td>
          <td>
            <TextBlock variant="bodyLarge" style="font-weight: 500;">
              ${(data.order.total || 0).toFixed(2)}
            </TextBlock>
          </td>
        </tr>
      </table>
    </div>

    <div class="card">
      <TextBlock variant="subtitle" class="card-header">Additional information</TextBlock>
      {#if data.order.ipAddress}
        <div>
          <TextBlock tag="div">
            IP Address: {data.order.ipAddress}
          </TextBlock>
        </div>
      {/if}
    </div>
  </div>

  <div>
    <div class="card">
      <TextBlock variant="subtitle" class="card-header">Customer</TextBlock>
      {#if data.order.billingPerson?.name || data.order.shippingPerson?.name}
        <div>
          <TextBlock variant="bodyStrong">
            {data.order.billingPerson?.name || data.order.shippingPerson?.name}
          </TextBlock>
        </div>
      {/if}
      {#if data.order.email}
        <div>
          <TextBlock>
            Email address: <a href="mailto:{data.order.email}">{data.order.email}</a>
          </TextBlock>
        </div>
      {/if}
      {#if data.order.billingPerson?.phone || data.order.shippingPerson?.phone}
        <div>
          <TextBlock>
            Phone {data.order.billingPerson?.phone || data.order.shippingPerson?.phone}
          </TextBlock>
        </div>
      {/if}
    </div>

    {#if data.order.shippingOption?.shippingMethodName}
      <div class="card">
        <TextBlock variant="subtitle" class="card-header">Shipping details</TextBlock>
        <div>
          <TextBlock>
            Selected method:
            {data.order.shippingOption.shippingMethodName}, ${(
              data.order.shippingOption.shippingRate || 0
            ).toFixed(2)}
          </TextBlock>
        </div>
        {#if data.order.shippingPerson}
          {@const { name, street, city, stateOrProvinceCode, postalCode, countryName } =
            data.order.shippingPerson}
          <div style="margin: 5px 0;">
            <div><TextBlock>{name}</TextBlock></div>
            <div><TextBlock>{street}</TextBlock></div>
            <div><TextBlock>{city}, {stateOrProvinceCode} {postalCode}</TextBlock></div>
            <div><TextBlock>{countryName}</TextBlock></div>
          </div>
        {/if}
      </div>
    {/if}

    {#if data.order.paymentMethod}
      <div class="card">
        <TextBlock variant="subtitle" class="card-header">Billing details</TextBlock>
        <div><TextBlock>{data.order.paymentMethod}</TextBlock></div>
        {#if data.order.externalTransactionId}
          <div style="margin-left: 20px;" class="lesser">
            <TextBlock>{data.order.externalTransactionId}</TextBlock>
          </div>
        {/if}
        {#if data.order.billingPerson}
          {@const { name, street, city, stateOrProvinceCode, postalCode, countryName } =
            data.order.billingPerson}
          <div style="margin: 5px 0;">
            <div><TextBlock>{name}</TextBlock></div>
            <div><TextBlock>{street}</TextBlock></div>
            <div><TextBlock>{city}, {stateOrProvinceCode} {postalCode}</TextBlock></div>
            <div><TextBlock>{countryName}</TextBlock></div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</article>

<style>
  .page-title {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0 20px;
    max-width: 1000px;
    margin: 32px auto 20px auto;
    box-sizing: border-box;
  }

  article {
    max-width: 1000px;
    padding: 0 20px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
  }

  article > div {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .card {
    background-color: var(--fds-card-background-secondary);
    border: 1px solid var(--fds-card-stroke-default);
    border-radius: var(--fds-control-corner-radius);
    padding: 20px;
  }

  .card :global(.card-header) {
    padding-bottom: 6px;
    font-size: 15px;
  }

  .item {
    display: grid;
    grid-template-columns: 72px 1fr 100px;
    gap: 12px;
    margin-bottom: 24px;
  }

  .item img {
    width: 72px;
    height: 72px;
    object-fit: cover;
    border-radius: var(--fds-control-corner-radius);
    margin-top: 4px;
  }

  .lesser {
    opacity: 0.8;
  }

  table.total {
    font-family: var(--fds-font-family-text);
    font-size: var(--fds-body-font-size);
    font-weight: 400;
    line-height: 20px;
    margin-left: auto;
  }

  table.total td:first-child {
    width: 100px;
  }

  table.total td:nth-child(2) {
    text-align: right;
  }

  .main-statuses {
    display: flex;
    flex-direction: row;
    gap: 20px;
  }

  .main-statuses :global(.field) {
    margin-bottom: 0 !important;
  }
</style>
