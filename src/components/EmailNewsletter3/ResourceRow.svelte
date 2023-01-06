<script lang="ts">
  export let label: string;
</script>

<td class="resource-td" width="33.33%" align="center" valign="top">
  <h4>{label}</h4>
  <slot />
</td>

<style>
  h4 {
    font-family: Roboto, sans-serif;
    font-size: 15px;
    line-height: 1.2;
    font-weight: 500;
    letter-spacing: normal;
    margin: 5px 0 5px 0;
    text-transform: uppercase;
    color: #000000;
  }

  td :global(p) {
    font-family: Roboto, sans-serif;
    font-size: 13px;
    line-height: 1.5;
    font-weight: 400;
    color: #000000;
  }

  td :global(a) {
    font-family: Roboto, sans-serif;
    font-size: 13px;
    line-height: 1.5;
    font-weight: 400;
    color: #003f76;
    display: block;
  }
</style>
