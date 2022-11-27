<script lang="ts">
  import { getTableRestProps } from '.';

  $: ({ tableRestProps } = getTableRestProps($$restProps));
</script>

<table
  width="100%"
  border={1}
  bordercolor="#e0e0e0"
  cellpadding={20}
  cellspacing={0}
  bgcolor="#ffffff"
  {...tableRestProps}
>
  <slot />
</table>

<style>
  table {
    border: 1px solid rgba(222, 222, 222, 0.7);
    background-color: #ffffff;
    padding: 20px;
    width: 100%;
    max-width: 640px;
    border-collapse: collapse;
  }
</style>
