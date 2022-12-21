/**
 * Whether a given object has a given key.
 */
export function hasKey<K extends string>(
  toCheck: unknown,
  key: K
): toCheck is { [key in K]: unknown } {
  return toCheck !== undefined && toCheck !== null && typeof toCheck === 'object' && key in toCheck;
}
