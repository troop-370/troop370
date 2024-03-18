import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const persistedValueStr =
  (browser && localStorage?.getItem('store:updatePreviewsWhileComposing')) || 'true';
const persistedValue = persistedValueStr === 'true';

export const updatePreviewsWhileComposing = writable(persistedValue);

updatePreviewsWhileComposing.subscribe((updatePreviewsWhileComposing) => {
  if (browser)
    localStorage?.setItem('store:updatePreviewsWhileComposing', `${updatePreviewsWhileComposing}`);
});
