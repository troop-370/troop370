import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const persistedCollapsedPaneValueStr =
  (browser && localStorage?.getItem('store:collapsedPane')) || null;
const persistedCollapsedPaneValue =
  persistedCollapsedPaneValueStr === 'true'
    ? true
    : persistedCollapsedPaneValueStr === 'false'
    ? false
    : undefined;

export const collapsedPane = writable(persistedCollapsedPaneValue || false);

collapsedPane.subscribe((collapsedPane) => {
  if (browser) localStorage?.setItem('store:collapsedPane', `${collapsedPane}`);
});

const persistedCollapsedPaneCompactValueStr =
  (browser && localStorage?.getItem('store:collapsedPaneCompact')) || null;
const persistedCollapsedPaneCompactValue =
  persistedCollapsedPaneCompactValueStr === 'true'
    ? true
    : persistedCollapsedPaneCompactValueStr === 'false'
    ? false
    : undefined;

export const collapsedPaneCompact = writable(persistedCollapsedPaneCompactValue || false);

collapsedPaneCompact.subscribe((collapsedPaneCompact) => {
  if (browser) localStorage?.setItem('store:collapsedPaneCompact', `${collapsedPaneCompact}`);
});
