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
  cellpadding={0}
  cellspacing={0}
  {...tableRestProps}
>
  <slot />
</table>

<style>
  table {
    width: 100%;
    max-width: 640px;
    border: none;
    margin: 20px 0 40px 0;
  }
</style>
