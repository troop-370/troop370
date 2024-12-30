import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const persistedValueStr = (browser && localStorage?.getItem('store:strapiEditor_4')) || null;
const persistedValue =
  persistedValueStr === 'true' ? true : persistedValueStr === 'false' ? false : false;

export const strapiEditor = writable(persistedValue);

strapiEditor.subscribe(($strapiEditor) => {
  if (browser) localStorage?.setItem('store:strapiEditor_4', `${$strapiEditor}`);
});

const modernCollections = ['api::newsletter.newsletter', 'api::post.post'];
export const isModernCollection = (collectionName: string) =>
  modernCollections.includes(collectionName);
