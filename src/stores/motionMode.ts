import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const persistedValueStr = (browser && localStorage?.getItem('store:motionMode')) || null;
const persistedValue =
  persistedValueStr === 'reduced'
    ? 'reduced'
    : persistedValueStr === 'no-preference'
    ? 'no-preference'
    : undefined;
const prefersReduced = browser && matchMedia('(prefers-reduced-motion: reduce)').matches;

export const motionMode = writable<'reduced' | 'no-preference'>(
  persistedValue ?? (prefersReduced ? 'reduced' : 'no-preference')
);

motionMode.subscribe((motionMode) => {
  if (browser) localStorage?.setItem('store:motionMode', `${motionMode}`);
});
