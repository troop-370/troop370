<script lang="ts">
  import { formatBytes } from '$utils';

  export let itemCount = -1;
  export let selectedItemsCount = 0;
  export let selectedItemsSize = 0;
  export let mimeTypes: string[] = [];

  const typesAreSame =
    Array.from(new Set(mimeTypes.map((mime) => mime.split('/')[0]))).length === 1;

  const allowedStr = mimeTypes.map((mime) => (typesAreSame ? mime.split('/')[1] : mime)).join(', ');
</script>

<div class="footer">
  <div class="footer-textblock noshrink">
    {#if itemCount > -1}
      {itemCount} item{itemCount === 1 ? '' : 's'}
    {/if}
  </div>
  {#if selectedItemsCount > 0}
    <div class="footer-textblock noshrink">
      {selectedItemsCount} item{selectedItemsCount === 1 ? '' : 's'} selected
      {' '}
      {#if selectedItemsSize > 0}
        ({formatBytes(selectedItemsSize, 0)})
      {/if}
    </div>
  {/if}
  {#if mimeTypes.length > 0}
    <div class="footer-textblock" style="margin-left: auto;">
      <span class="nowrap">Allowed types: {allowedStr}</span>
    </div>
  {/if}
</div>

<style>
  .footer {
    display: flex;
    flex-shrink: 0;
    position: relative;
    width: 100%;
    max-width: 100vw;
    padding: 0px 7px;
    height: 24px;
    border: 1px solid var(--fds-divider-stroke-default);
    border-top-width: 0;
    box-sizing: border-box;
    overflow: hidden;
    color: var(--fds-text-secondary);
    border-radius: 0 0 var(--fds-control-corner-radius) var(--fds-control-corner-radius);
    font-size: 12px;
    line-height: 24px;
  }

  .footer-textblock {
    height: 24px;
    background-color: transparent;
    color: var(--fds-text-secondary);
    padding: 0px 4px 2px;
    border: 1px solid transparent;
    display: inline-flex;
    text-decoration: none;
    border-radius: 0px;
    min-width: 40px;
    user-select: none;
    box-sizing: border-box;
    font-weight: 400;
    cursor: default;
    font-size: 12px;
    font-family: var(--fds-font-family-small);
    align-items: center;
    text-wrap: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  button.footer-textblock:hover {
    background-color: var(--fds-subtle-fill-secondary);
  }
  button.footer-textblock:active {
    background-color: var(--fds-subtle-fill-tertiary);
    color: var(--fds-text-secondary);
  }
  button.footer-textblock:focus-visible {
    box-shadow: var(--fds-focus-stroke);
  }

  .nowrap {
    max-width: var(--max-width);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .noshrink {
    flex-shrink: 0;
  }
</style>
