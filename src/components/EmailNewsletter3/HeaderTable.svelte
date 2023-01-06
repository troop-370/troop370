<script lang="ts">
  import { getTableRestProps } from '.';

  export let table$class = '';
  export let table$style = '';

  $: ({ tableRestProps } = getTableRestProps($$restProps));
</script>

<table
  class={table$class}
  style={table$style}
  width="100%"
  border={0}
  cellpadding={20}
  cellspacing={0}
  bgcolor="#003f87"
  {...tableRestProps}
>
  <slot />
</table>

<style>
  table {
    border: none;
    background-color: #003f87;
    padding: 20px;
    width: 100%;
    border-collapse: collapse;
  }
</style>
