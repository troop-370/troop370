<script lang="ts">
  import { getTableRestProps } from '.';

  export let table$class = '';
  export let table$style = '';

  $: ({ tableRestProps, tdRestProps, trRestProps } = getTableRestProps($$restProps));
</script>

<table
  class={table$class}
  style={table$style}
  width="100%"
  data-imagetype="External"
  border={0}
  cellpadding="0"
  cellspacing="0"
  {...tableRestProps}
>
  <slot />
</table>

<style>
  table {
    background: none;
    border: none;
  }
</style>
