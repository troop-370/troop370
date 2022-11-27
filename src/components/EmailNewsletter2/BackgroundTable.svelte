<script lang="ts">
  import { getTableRestProps } from '.';

  export let table$class = '';
  export let table$style = '';
  export let tr$class = '';
  export let tr$style = '';
  export let td$class = '';
  export let td$style = '';

  $: ({ tableRestProps, tdRestProps, trRestProps } = getTableRestProps($$restProps));
</script>

<table
  class={table$class}
  style={table$style}
  width="100%"
  data-imagetype="External"
  background="https://imgssl.constantcontact.com/letters/images/backgrounds/citygrid.png"
  border={0}
  cellpadding="0"
  cellspacing="0"
  {...tableRestProps}
>
  <tr class={tr$class} style={tr$style} {...trRestProps}>
    <td class={td$class} style={td$style} align="center" {...tdRestProps}>
      <slot />
    </td>
  </tr>
</table>

<style>
  table {
    background: url(https://imgssl.constantcontact.com/letters/images/backgrounds/citygrid.png)
      repeat top left;
    background-color: #ffffff;
  }
</style>
