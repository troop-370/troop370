<script lang="ts">
  export let position: 'left' | 'right' | 'center' = 'center';
  export let noBorder = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="widget-wrapper"
  class:left={position === 'left'}
  class:right={position === 'right'}
  class:noBorder
  on:click
  contenteditable="false"
>
  <slot />
</div>

<style>
  .widget-wrapper {
    position: relative;
    min-height: 20px;
    display: flex;
    flex-direction: column;
  }

  .widget-wrapper.left {
    float: left;
    width: 50%;
    margin: 10px 20px 10px 0;
  }

  .widget-wrapper.right {
    float: right;
    width: 50%;
    margin: 10px 0 10px 20px;
  }

  .widget-wrapper:not(.left):not(.right) {
    width: 100%;
    border-top: 1px solid #cccccc;
    border-bottom: 1px solid #cccccc;
    margin: 20px 0;
  }

  .widget-wrapper.noBorder {
    border: none !important;
  }
</style>
