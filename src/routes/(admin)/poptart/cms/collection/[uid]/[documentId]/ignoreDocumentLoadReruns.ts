import { browser } from '$app/environment';

// this is a workaround to prevent the store from being reset on navigation
// and is only stored on the client side
let cache: Record<string, any> = {};

/**
 * Persists a value as a variable outside the load function **in browser only**
 * so that it is not reset when the load function re-runs.
 */
export async function ignoreDocumentLoadReruns<T>(
  /** The variabe name for which reruns should be ignored. */
  key: string,
  /** An asynchronous callback that returns the variable to be stored. */
  cb: () => T | Promise<T>,
  { overwrite = false }: { overwrite?: boolean } = {}
): Promise<T> {
  // do not use a cache in the server
  if (!browser) return await cb();

  // if the variable is already in the cache, return it
  if (cache[key] && !overwrite) return cache[key];

  // otherwise, set the variable in the cache and return it
  cache[key] = await cb();
  return cache[key];
}

export async function clearDocumentLoadRerunCache() {
  cache = {};
}
