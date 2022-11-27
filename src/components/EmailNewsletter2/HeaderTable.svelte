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
  border={1}
  bordercolor="e0e0e0"
  cellpadding={5}
  cellspacing={0}
  bgcolor="#003f87"
  {...tableRestProps}
>
  <slot />
</table>

<style>
  table {
    border: 1px solid rgba(222, 222, 222, 0.7);
    background-color: #003f87;
    padding: 20px;
    width: 100%;
    max-width: 640px;
    border-collapse: collapse;
  }
</style>
