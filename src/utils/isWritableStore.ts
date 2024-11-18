import { isObjectLike } from 'is-what';
import type { Writable } from 'svelte/store';
import { hasKey } from './hasKey';

export function isWritableStore<T = Record<string, unknown>>(
  toCheck: unknown
): toCheck is Writable<T> {
  return (
    isObjectLike(toCheck) &&
    toCheck &&
    hasKey(toCheck, 'set') &&
    hasKey(toCheck, 'update') &&
    hasKey(toCheck, 'subscribe')
  );
}
