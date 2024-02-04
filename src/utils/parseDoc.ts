/**
 * Processes a doc from a Strapi REST API endpoint.
 * It flattens the doc so that `id` is merged with attributes,
 * and then only attributes is returned.
 */
export function parseDoc<T extends StrapiDoc<T['attributes']>>(doc: T): Doc<T> | null {
  if (doc && doc.id && doc.attributes) {
    return { id: doc.id, ...doc.attributes };
  }
  return null;
}

interface StrapiDoc<K> {
  id?: number;
  attributes?: K;
}

type Doc<K extends StrapiDoc<K['attributes']>> = { id: number } & NonNullable<K>['attributes'];
