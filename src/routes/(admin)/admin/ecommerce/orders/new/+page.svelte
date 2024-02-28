<script lang="ts">
  import FieldWrapper from '$components/admin/FieldWrapper.svelte';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { ActionRow, PageSubtitle, PageTitle } from '$lib/common/PageTitle';
  import { compactMode } from '$stores/compactMode';
  import { capitalize, notEmpty } from '$utils';
  import {
    stateNameToAbbreviation,
    stateNames,
    type lowercaseStateNames,
  } from '$utils/stateNameToAbbreviation';
  import {
    Button,
    Checkbox,
    ComboBox,
    InfoBar,
    MenuFlyout,
    MenuFlyoutItem,
    TextBlock,
    TextBox,
  } from 'fluent-svelte';
  import { z } from 'zod';
  import {
    fulfillmentStatuses,
    orderEntrySchema,
    orderItemSchema,
    paymentStatuses,
  } from '../../ecwidSchemas';

  export let data;
  $: ({ productsStore, shippingOptionsStore } = data);
  $: products = $productsStore.data?.docs.filter((doc) => doc.enabled);

  let paymentStatusDropdownOpen = false;
  let fulfillmentStatusDropdownOpen = false;

  // contact details
  let fullName: string;
  let phone: number;
  let email: string;

  // billing person
  let street: string;
  let city: string;
  let state: typeof lowercaseStateNames = 'georgia';
  $: stateCode = stateNameToAbbreviation(state);
  let postalCode: number;

  // shipping
  let shippingMethodId: string;

  // statuses
  let paymentStatus: (typeof paymentStatuses)[number] = 'INCOMPLETE';
  let fulfillmentStatus: (typeof fulfillmentStatuses)[number] = 'AWAITING_PROCESSING';
  let privateAdminNotes = '';

  // items [id, value]
  let itemQuantities: [number, number][] = [];
  $: if (products && products.length !== itemQuantities.length) {
    itemQuantities = products.map((product): [number, number] => [product.id, 0]);
  }

  // options
  let itemOptions: [number, { type: string; name: string; value: string }[]][] = [];
  $: if (products && products.length !== itemOptions.length) {
    itemOptions = products.map((product): (typeof itemOptions)[number] => [
      product.id,
      product.options?.map((opt) => ({ type: opt.type, name: opt.name || '', value: '' })) || [],
    ]);
  }

  // order
  $: order = {
    email: email?.length > 0 ? email : undefined,
    items: itemQuantities
      .filter(([id, quantity]) => quantity > 0)
      .map(([id, quantity]) => {
        const product = products?.find((product) => product.id === id);
        if (!product) return null;

        const options = itemOptions
          .filter(([productId]) => productId === id)
          .flatMap(([, opts]) => opts)
          .map((opt) => ({ type: opt.type, name: opt.name, value: `${opt.value}` }));

        return {
          id,
          quantity,
          price: product.price,
          productPrice: product.price,
          categoryId: product.categoryIds?.[0] || 0,
          weight: product.weight,
          sku: product.sku,
          shortDescription: product.description?.slice(0, 120),
          // tax,
          // shipping,
          // quantityInStock,
          name: product.name,
          isShippingRequired: product.isShippingRequired,
          imageUrl: product.imageUrl,
          fixedShippingRate: product.fixedShippingRate,
          // digital,
          couponApplied: false,
          selectedOptions: options,
          dimensions: product.dimensions,
          couponAmount: 0,
          discounts: [],
        } satisfies z.infer<typeof orderItemSchema>;
      })
      .filter(notEmpty),
    billingPerson: {
      name: fullName?.length > 0 ? fullName : undefined,
      street: street?.length > 0 ? street : undefined,
      city: city?.length > 0 ? city : undefined,
      countryCode: 'US',
      countryName: 'United States of America',
      postalCode: postalCode > 10000 ? `${postalCode}`.replace(/\D+/g, '') : undefined,
      stateOrProvinceCode: stateCode,
      stateOrProvinceName: state,
      phone: `${phone}`.replace(/\D+/g, ''),
    },
    shippingOption: {
      shippingMethodId: shippingMethodId ? shippingMethodId : undefined,
    },
    privateAdminNotes,
  };

  const orderDetailsPayloadSchema = orderEntrySchema
    .merge(
      z.object({
        email: z.string(),
        items: z.object({ id: z.number(), price: z.number(), quantity: z.number() }).array(),
        billingPerson: z.object({
          name: z.string(),
          companyName: z.string().optional(),
          street: z.string(),
          city: z.string(),
          countryCode: z.string(),
          countryName: z.string(),
          postalCode: z.string(),
          stateOrProvinceCode: z.string(),
          stateOrProvinceName: z.string(),
          phone: z.string(),
        }),
        shippingOption: z.object({
          shippingMethodId: z.string(),
        }),
        privateAdminNotes: z.string().optional(),
      })
    )
    .omit({ id: true });
</script>

<PageTitle>Create new manual order</PageTitle>

<ActionRow>
  <Button
    variant="accent"
    disabled={orderDetailsPayloadSchema.safeParse(order).success === false}
    on:click={() => data.calculateOrderDetails(order)}
  >
    Create
  </Button>
</ActionRow>

<section>
  <InfoBar closable={false}>To create a new item, complete the required fields below.</InfoBar>
</section>

{#if products}
  <PageSubtitle>Contact details</PageSubtitle>
  <section>
    <FieldWrapper label="Full name*" forId="billingPerson.name">
      <TextBox id="billingPerson.name" bind:value={fullName} />
    </FieldWrapper>

    <FieldWrapper label="Phone*" forId="billingPerson.phone">
      <TextBox id="billingPerson.phone" bind:value={phone} type="number" />
    </FieldWrapper>

    <FieldWrapper label="Email*" forId="email">
      <TextBox id="email" bind:value={email} />
    </FieldWrapper>
  </section>

  <PageSubtitle>Billing address</PageSubtitle>
  <section>
    <FieldWrapper label="Street*" forId="billingPerson.street">
      <TextBox id="billingPerson.street" bind:value={street} />
    </FieldWrapper>

    <div class="address-line-3">
      <FieldWrapper label="City*" forId="billingPerson.city">
        <TextBox id="billingPerson.city" bind:value={city} />
      </FieldWrapper>

      <FieldWrapper label="State*" forId="billingPerson.stateOrProvinceName">
        <ComboBox
          items={stateNames.map((stateName) => ({
            name: stateName,
            value: stateName.toLowerCase(),
          }))}
          id="billingPerson.stateOrProvinceName"
          bind:value={state}
        />
      </FieldWrapper>

      <FieldWrapper label="Postal/ZIP code*" forId="pc">
        <TextBox id="pc" bind:value={postalCode} />
      </FieldWrapper>
    </div>
  </section>

  <PageSubtitle>Shipping</PageSubtitle>
  <section>
    <InfoBar closable={false} style="margin-bottom: 10px;">
      The billing address will also be used as the shipping address.
    </InfoBar>

    <FieldWrapper label="Shipping option*" forId="shippingOption.shippingMethodId">
      <ComboBox
        items={$shippingOptionsStore.data?.docs
          .filter((opt) => opt.enabled)
          .map(({ id, title, fulfilmentType }) => ({
            name: `${title} [${fulfilmentType}]`,
            value: id,
          }))}
        id="shippingOption.shippingMethodId"
        bind:value={shippingMethodId}
      />
    </FieldWrapper>
  </section>

  <PageSubtitle>Order status</PageSubtitle>
  <section>
    <div class="statuses">
      <FieldWrapper label="Payment status" forId="paymentStatus">
        <div style="display: flex;">
          <MenuFlyout alignment="start" placement="bottom" bind:open={paymentStatusDropdownOpen}>
            <svelte:fragment slot="flyout">
              {#each paymentStatuses as status}
                <MenuFlyoutItem selected={paymentStatus === status}>
                  {capitalize(status.toLowerCase().replaceAll('_', ' '))}
                </MenuFlyoutItem>
              {/each}
            </svelte:fragment>
          </MenuFlyout>
          <Button
            style="width: fit-content;"
            on:click={() => (paymentStatusDropdownOpen = !paymentStatusDropdownOpen)}
          >
            {capitalize(paymentStatus.toLowerCase() || '').replaceAll('_', ' ')}
            <FluentIcon name="ChevronDown16Regular" mode="buttonIconRight" />
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
                <MenuFlyoutItem selected={fulfillmentStatus === status}>
                  {capitalize(status.toLowerCase().replaceAll('_', ' '))}
                </MenuFlyoutItem>
              {/each}
            </svelte:fragment>
          </MenuFlyout>
          <Button
            style="width: fit-content;"
            on:click={() => (fulfillmentStatusDropdownOpen = !fulfillmentStatusDropdownOpen)}
          >
            {capitalize(fulfillmentStatus.toLowerCase().replaceAll('_', ' ') || '')}
            <FluentIcon name="ChevronDown16Regular" mode="buttonIconRight" />
          </Button>
        </div>
      </FieldWrapper>
    </div>

    <FieldWrapper label="Additional notes" forId="privateAdminNotes">
      <TextBox id="privateAdminNotes" bind:value={privateAdminNotes} />
    </FieldWrapper>
  </section>

  <PageSubtitle>Items</PageSubtitle>
  <section>
    <div class="products" class:compact={$compactMode}>
      {#each products as product, index}
        <div class="product" class:compact={$compactMode}>
          <img src={product.imageUrl} alt="" />
          <div class="product-meta">
            <TextBlock>{product.name}</TextBlock>
            <div class="product-buttons">
              <Button
                style="border-top-right-radius: 0; border-bottom-right-radius: 0;"
                on:click={() => itemQuantities[index][1]--}
              >
                -
              </Button>
              <TextBox
                style="width: 40px;"
                bind:value={itemQuantities[index][1]}
                clearButton={false}
              />
              <Button
                style="border-top-left-radius: 0; border-bottom-left-radius: 0;"
                on:click={() => itemQuantities[index][1]++}
              >
                +
              </Button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </section>

  {#if itemQuantities.filter(([, q]) => q > 0).length > 0}
    <PageSubtitle>Options</PageSubtitle>
    <section>
      {#each itemOptions as [productId, options]}
        {@const product = products.find((product) => product.id === productId)}
        {@const [, quantity] = itemQuantities.find(([_productId]) => _productId === productId) || [
          productId,
          0,
        ]}

        {#if quantity > 0}
          {#each options as opt, optIndex}
            <FieldWrapper
              label={`[${product?.name}] ${opt.name}`}
              forId={`${productId}_${optIndex}`}
            >
              {#if opt.type === 'CHECKBOX'}
                <Checkbox id={`${productId}_${optIndex}`} bind:checked={opt.value} />
              {:else}
                <TextBox id={`${productId}_${optIndex}`} bind:value={opt.value} />
              {/if}
            </FieldWrapper>
          {/each}
        {/if}
      {/each}
    </section>
  {/if}
{/if}

<div style="padding-bottom: 60px;" />

<style>
  section {
    margin: 0 auto;
    padding: 0 20px;
    max-width: 1000px;
  }

  .address-line-3 {
    display: grid;
    grid-template-columns: 1fr 240px 140px;
    gap: 20px;
  }

  .statuses {
    display: flex;
    flex-direction: row;
    gap: 20px;
  }

  .products {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 10px;
  }
  .products.compact {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 8px;
  }

  .product {
    display: flex;
    flex-direction: row;
    gap: 20px;
    align-items: start;
    background-color: var(--fds-card-background-secondary);
    border: 1px solid var(--fds-card-stroke-default);
    border-radius: var(--fds-control-corner-radius);
    padding: 20px;
  }
  .product.compact {
    padding: 10px;
    gap: 12px;
  }

  .product img {
    width: 60px;
    height: 60px;
    border-radius: var(--fds-control-corner-radius);
  }
  .product.compact img {
    width: 30px;
    height: 30px;
  }

  .product-meta {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex-grow: 1;
  }
  .product.compact .product-meta {
    flex-direction: row;
    align-items: center;
  }

  .product-meta :global(.text-block) {
    line-height: 14px !important;
    flex-grow: 1;
  }

  .product-buttons {
    display: flex;
    flex-direction: row;
    width: 100px;
  }

  .product-buttons :global(.text-box-container) {
    border-radius: 0 !important;
    box-shadow: inset 0 1px 0 0 var(--fds-control-stroke-default),
      inset 0 -1px 0 0 var(--fds-control-stroke-default);
  }
  .product-buttons :global(.text-box-container input) {
    text-align: center;
    padding-inline: 0;
  }
  .product-buttons :global(.text-box-underline) {
    border-radius: 0 !important;
  }
</style>
