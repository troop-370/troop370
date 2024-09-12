<script lang="ts">
  import { cn } from '$lib/utils.js';
  import { Button as ButtonPrimitive } from 'bits-ui';
  import { type Events, type Props, buttonVariants } from './index.js';

  type $$Props = Props;
  type $$Events = Events;

  let className: $$Props['class'] = undefined;
  export let variant: $$Props['variant'] = 'default';
  export let size: $$Props['size'] = 'default';
  export let builders: $$Props['builders'] = [];
  export { className as class };
  export let disabled = false;
  export let href = '';
</script>

<ButtonPrimitive.Root
  {builders}
  class={cn(buttonVariants({ variant, size, className }))}
  type="button"
  {...$$restProps}
  {disabled}
  href={(!disabled && href) || ''}
  on:click
  on:keydown
>
  <slot />
</ButtonPrimitive.Root>
