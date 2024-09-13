import type { Button as ButtonPrimitive } from 'bits-ui';
import { type VariantProps, tv } from 'tailwind-variants';
import Root from './button.svelte';

const buttonVariants = tv({
  base: 'ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/80 active:bg-primary/70',
      destructive:
        'bg-destructive text-destructive-foreground hover:bg-destructive/80 active:bg-destructive/70',
      outline:
        'border-input bg-background hover:bg-accent hover:text-accent-foreground border active:bg-primary/10',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground active:bg-primary/10',
      link: 'text-primary underline-offset-4 hover:underline',
    },
    size: {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

type Variant = VariantProps<typeof buttonVariants>['variant'];
type Size = VariantProps<typeof buttonVariants>['size'];

type Props = ButtonPrimitive.Props & {
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  href?: string;
};

type Events = ButtonPrimitive.Events;

export {
  //
  Root as Button,
  Root,
  buttonVariants,
  type Events as ButtonEvents,
  type Props as ButtonProps,
  type Events,
  type Props,
};