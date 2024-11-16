export { default as SelectMany } from './SelectMany.svelte';
export { default as SelectOne } from './SelectOne.svelte';

export interface Option {
  label?: string;
  _id: string;
  disabled?: boolean;
  reason?: string;
  isDndShadowItem?: boolean;

  /** @deprecated */
  errorMessage?: string;
  /** @deprecated */
  identifier?: string;
}
