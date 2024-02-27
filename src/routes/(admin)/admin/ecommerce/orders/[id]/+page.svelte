<script lang="ts">
  import { invalidate } from '$app/navigation';
  import { page } from '$app/stores';
  import FieldWrapper from '$components/admin/FieldWrapper.svelte';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { compactMode } from '$stores/compactMode.js';
  import { capitalize, formatISODate, openWindow } from '$utils';
  import {
    Button,
    ContentDialog,
    MenuFlyout,
    MenuFlyoutItem,
    ProgressRing,
    TextBlock,
    TextBox,
  } from 'fluent-svelte';
  import type { z } from 'zod';
  import { fulfillmentStatuses, orderEntrySchema, paymentStatuses } from '../../ecwidSchemas.js';
  import OrderSelectedOption from './OrderSelectedOption.svelte';

  export let data;

  let paymentStatusDropdownOpen = false;
  let fulfillmentStatusDropdownOpen = false;
  let privateAdminNotesDialogOpen = false;

  let paymentStatusLoading = false;
  let fulfillmentStatusLoading = false;
  let itemOptionLoading = false;
  let privateAdminNotesLoading = false;
  $: loading =
    paymentStatusLoading ||
    fulfillmentStatusLoading ||
    itemOptionLoading ||
    privateAdminNotesLoading;

  let newPrivateAdminNotesValue = data.order.privateAdminNotes || '';
  function restoreNewPrivateAdminNotes(unused: string | undefined) {
    newPrivateAdminNotesValue = data.order.privateAdminNotes || '';
  }
  $: restoreNewPrivateAdminNotes(data.order.privateAdminNotes);

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

  async function updateFulfillmentStatus(
    newFulfillmentStatus: (typeof fulfillmentStatuses)[number]
  ) {
    if (newFulfillmentStatus === data.order.fulfillmentStatus) return;

    fulfillmentStatusLoading = true;

    const orderUpdate = {
      id: data.order.id,
      fulfillmentStatus: newFulfillmentStatus,
    } satisfies z.infer<typeof orderEntrySchema>;

    await fetch('', { method: 'PATCH', body: JSON.stringify(orderUpdate) }).then(async () => {
      await invalidate('order-page');
    });

    fulfillmentStatusLoading = false;
  }

  async function updateItemOption(itemIndex: number, optionName: string, optionValue: string) {
    itemOptionLoading = true;

    const items = data.order.items || [];

    const options = items[itemIndex].selectedOptions;
    const optionIndex = options?.findIndex((opt) => opt.name === optionName);

    const updatedOptions =
      options && optionIndex !== undefined
        ? options.splice(optionIndex, 1, {
            ...options[optionIndex],
            value: optionValue,
          })
        : [];

    const updatedItem = {
      ...items[itemIndex],
      selectedOptions: updatedOptions,
    } satisfies NonNullable<NonNullable<z.infer<typeof orderEntrySchema>>['items']>[number];

    const orderUpdate = {
      id: data.order.id,
      items: items.splice(itemIndex, 1, updatedItem),
    } satisfies z.infer<typeof orderEntrySchema>;

    await fetch('', { method: 'PATCH', body: JSON.stringify(orderUpdate) }).then(async () => {
      await invalidate('order-page');
    });

    itemOptionLoading = false;
  }

  async function updatePrivateAdminNotes(newPrivateAdminNotes: string) {
    if (newPrivateAdminNotes === data.order.privateAdminNotes) return;

    privateAdminNotesLoading = true;

    const orderUpdate = {
      id: data.order.id,
      privateAdminNotes: newPrivateAdminNotes,
    } satisfies z.infer<typeof orderEntrySchema>;

    await fetch('', { method: 'PATCH', body: JSON.stringify(orderUpdate) }).then(async () => {
      await invalidate('order-page');
    });

    privateAdminNotesLoading = false;
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

<article class:compact={$compactMode}>
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
                {#each fulfillmentStatuses as status}
                  <MenuFlyoutItem
                    selected={data.order.fulfillmentStatus === status}
                    on:click={() => updateFulfillmentStatus(status)}
                  >
                    {capitalize(status.toLowerCase().replaceAll('_', ' '))}
                  </MenuFlyoutItem>
                {/each}
              </svelte:fragment>
            </MenuFlyout>
            <Button
              style="width: fit-content;"
              disabled={loading}
              on:click={() => (fulfillmentStatusDropdownOpen = !fulfillmentStatusDropdownOpen)}
            >
              {#if fulfillmentStatusLoading}
                <ProgressRing
                  style="--fds-accent-default: currentColor; position: absolute;"
                  size={16}
                />
              {/if}
              <div
                style="display: flex; visibility: {fulfillmentStatusLoading
                  ? 'hidden'
                  : 'visible'};"
              >
                {capitalize(data.order.fulfillmentStatus?.toLowerCase().replaceAll('_', ' ') || '')}
                <FluentIcon name="ChevronDown16Regular" mode="buttonIconRight" />
              </div>
            </Button>
          </div>
        </FieldWrapper>
      </div>
    </div>

    <div class="card">
      <TextBlock variant="subtitle" class="card-header">Order items</TextBlock>
      {#each data.order.items || [] as item, itemIndex}
        <div class="item">
          <img src={item.imageUrl} alt="" />
          <div>
            <TextBlock variant="bodyStrong">{item.name}</TextBlock>
            <div style="margin-bottom: 6px;" class="lesser">
              <TextBlock>SKU: {item.sku}</TextBlock>
            </div>
            {#each item.selectedOptions || [] as option, optionIndex}
              <OrderSelectedOption
                {option}
                disabled={loading}
                handleSave={async (newValue) => {
                  if (option.name) updateItemOption(itemIndex, option.name, newValue);
                  return true;
                }}
              />
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
      <div>
        <TextBlock tag="div">
          Notes: {data.order.privateAdminNotes || '<no value>'}
          <Button
            variant="hyperlink"
            disabled={loading}
            on:click={() => (privateAdminNotesDialogOpen = !privateAdminNotesDialogOpen)}
          >
            Edit
          </Button>
        </TextBlock>
      </div>
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
        <TextBlock variant="subtitle" class="card-header">
          {#if data.order.shippingOption.isPickup}
            Pickup details
          {:else}
            Shipping details
          {/if}
        </TextBlock>
        <div>
          <TextBlock>
            Selected method:
            {data.order.shippingOption.shippingMethodName}, ${(
              data.order.shippingOption.shippingRate || 0
            ).toFixed(2)}
          </TextBlock>
        </div>
        {#if data.order.shippingPerson && !data.order.shippingOption.isPickup}
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

    {#if data.order.paymentMethod || data.order.billingPerson}
      <div class="card">
        <TextBlock variant="subtitle" class="card-header">Billing details</TextBlock>
        {#if data.order.paymentMethod}
          <div><TextBlock>{data.order.paymentMethod}</TextBlock></div>
          {#if data.order.externalTransactionId}
            <div style="margin-left: 20px;" class="lesser">
              <TextBlock>{data.order.externalTransactionId}</TextBlock>
            </div>
          {/if}
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

<ContentDialog
  bind:open={privateAdminNotesDialogOpen}
  title="Edit notes"
  on:close={() => restoreNewPrivateAdminNotes('')}
>
  <TextBox
    bind:value={newPrivateAdminNotesValue}
    on:keydown={(evt) => {
      if (evt.key === 'Enter' && !evt.ctrlKey && !evt.shiftKey && !evt.altKey && !evt.metaKey) {
        updatePrivateAdminNotes(newPrivateAdminNotesValue).finally(() => {
          privateAdminNotesDialogOpen = false;
        });
      }
    }}
  />

  <svelte:fragment slot="footer">
    <Button
      slot="footer"
      variant="accent"
      on:click={async () => {
        await updatePrivateAdminNotes(newPrivateAdminNotesValue);
        privateAdminNotesDialogOpen = false;
      }}
      disabled={loading}
    >
      {#if privateAdminNotesLoading}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        Save
      {/if}
    </Button>
    <Button slot="footer" on:click={() => (privateAdminNotesDialogOpen = false)} disabled={loading}>
      Do not save
    </Button>
  </svelte:fragment>
</ContentDialog>

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
    width: calc(100% - 40px);
  }

  article {
    max-width: 1000px;
    padding: 0 20px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
  }

  article.compact {
    gap: 15px;
  }

  article > div {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  article.compact > div {
    gap: 15px;
  }

  .card {
    background-color: var(--fds-card-background-secondary);
    border: 1px solid var(--fds-card-stroke-default);
    border-radius: var(--fds-control-corner-radius);
    padding: 25px;
  }
  article.compact .card {
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
