export { default as SelectMany } from './SelectMany.svelte';
export { default as SelectOne } from './SelectOne.svelte';

export interface Option {
  label?: string;
  _id: string;
  disabled?: boolean;
  reason?: string;
  isDndShadowItem?: boolean;
}

export interface YDocOption<T extends string | number> extends Omit<Option, '_id'> {
  value: T;
  label: string;
}
