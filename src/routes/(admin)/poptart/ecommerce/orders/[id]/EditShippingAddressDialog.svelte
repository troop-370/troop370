<script lang="ts">
  import FieldWrapper from '$components/poptart/FieldWrapper.svelte';
  import { stateNameToAbbreviation, stateNames } from '$utils/stateNameToAbbreviation';
  import { Button, ComboBox, ContentDialog, ProgressRing, TextBox } from 'fluent-svelte';

  export let name: string;
  export let street: string;
  export let city: string;
  export let stateOrProvinceName: string;
  export let postalCode: string;

  export let open = false;
  export let loading = false;

  export let handleSave:
    | ((data: {
        name: string;
        street: string;
        city: string;
        stateOrProvinceCode: string;
        stateOrProvinceName: string;
        postalCode: string;
      }) => Promise<void>)
    | undefined = undefined;
</script>

<ContentDialog bind:open title="Edit shipping address">
  <FieldWrapper label="Full name" forId="name">
    <TextBox id="name" bind:value={name} />
  </FieldWrapper>

  <FieldWrapper label="Street" forId="street">
    <TextBox id="street" bind:value={street} />
  </FieldWrapper>

  <div class="address-line-3">
    <FieldWrapper label="City" forId="city" style="grid-area: city;">
      <TextBox id="city" bind:value={city} />
    </FieldWrapper>

    <FieldWrapper label="State" forId="stateOrProvinceName">
      <ComboBox
        items={stateNames.map((stateName) => ({
          name: stateName,
          value: stateName.toLowerCase(),
        }))}
        id="stateOrProvinceName"
        bind:value={stateOrProvinceName}
      />
    </FieldWrapper>

    <FieldWrapper label="Postal/ZIP code" forId="pc">
      <TextBox id="pc" bind:value={postalCode} />
    </FieldWrapper>
  </div>

  <svelte:fragment slot="footer">
    <Button
      slot="footer"
      variant="accent"
      on:click={async () => {
        loading = true;
        await handleSave?.({
          name,
          street,
          city,
          stateOrProvinceName,
          stateOrProvinceCode: stateNameToAbbreviation(stateOrProvinceName),
          postalCode,
        });
        loading = false;
        open = false;
      }}
      disabled={loading}
    >
      {#if loading}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        Save
      {/if}
    </Button>
    <Button slot="footer" on:click={() => (open = false)} disabled={loading}>Do not save</Button>
  </svelte:fragment>
</ContentDialog>
