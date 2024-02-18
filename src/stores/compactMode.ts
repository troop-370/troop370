import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const persistedValueStr = (browser && localStorage?.getItem('store:compactMode')) || null;
const persistedValue =
  persistedValueStr === 'true' ? true : persistedValueStr === 'false' ? false : undefined;
const isTouchDevice = browser && matchMedia('(pointer:course)').matches;

export const compactMode = writable(persistedValue ?? !isTouchDevice);

compactMode.subscribe((compactMode) => {
  if (browser) localStorage?.setItem('store:compactMode', `${compactMode}`);
});
