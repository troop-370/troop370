import { browser } from '$app/environment';
import type { Writable } from 'svelte/store';
import { get, writable } from 'svelte/store';

/**
 * Create a writable store that persists to localStorage or sessionStorage.
 * @param key - key name to use in storage
 * @param initValue - initial value of the store
 * @param storage - 'localStorage' or 'sessionStorage'
 * @param expires - time in milliseconds before the store expires
 * @returns a writable store
 */
const storage = <T>(
  key: string,
  initValue: T,
  storage: 'localStorage' | 'sessionStorage' = 'localStorage',
  expires = 0
): Writable<T> => {
  const store = writable(initValue);
  if (!browser) return store;

  const _storage = storage === 'localStorage' ? localStorage : sessionStorage;

  const storedValueStr = _storage.getItem(key);
  if (storedValueStr != null) {
    const parsed = JSON.parse(storedValueStr);

    const timestamp = parsed.__storageLastUpdated;
    const expired = expires > 0 && Date.now() - timestamp > expires;
    if (expired) {
      store.set(initValue);
    } else {
      store.set(parsed);
    }
  }

  store.subscribe((val) => {
    if (val === null || val === undefined) {
      _storage.removeItem(key);
    } else {
      _storage.setItem(key, JSON.stringify({ ...val, __storageLastUpdated: Date.now() }));
    }
  });

  window.addEventListener('storage', () => {
    const storedValueStr = _storage.getItem(key);
    if (storedValueStr == null) return;

    const localValue: T = JSON.parse(storedValueStr);
    if (localValue !== get(store)) store.set(localValue);
  });

  return store;
};

export default storage;
