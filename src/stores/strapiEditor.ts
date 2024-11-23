import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const persistedValueStr = (browser && localStorage?.getItem('store:strapiEditor')) || null;
const persistedValue =
  persistedValueStr === 'true' ? true : persistedValueStr === 'false' ? false : true;

export const strapiEditor = writable(persistedValue);

strapiEditor.subscribe(($strapiEditor) => {
  if (browser) localStorage?.setItem('store:strapiEditor', `${$strapiEditor}`);
});
