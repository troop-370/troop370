/**
 * Awaits all the values of an object and returns a new object with the awaited values.
 *
 * Useful for SvelteKit, which requires data returned from a load function to not be promises.
 */
export async function awaited<T extends Record<string, any>>(
  obj: T
): Promise<{ [K in keyof T]: Awaited<T[K]> }> {
  const entries = await Promise.all(
    Object.entries(obj).map(async ([key, value]) => [key, await value])
  );
  return Object.fromEntries(entries) as { [K in keyof T]: Awaited<T[K]> };
}
