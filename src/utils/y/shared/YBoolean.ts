import type * as Y from 'yjs';

/**
 * Booleans are stored in a shared map that contain
 * all booleans. The field's value is stored as a key
 * in the map.
 */
class YBoolean<T extends string, V extends boolean | undefined | null> {
  map: Y.Map<Record<T, V>>;

  constructor(ydoc: Y.Doc) {
    this.map = ydoc.getMap<Record<T, V>>('__checkboxes');
  }

  set(key: T, value: V): V {
    return this.map.set(key, value);
  }

  has(key: T): boolean {
    return this.map.has(key);
  }

  get(key: T): V {
    return this.map.get(key) as V;
  }

  delete(key: T): void {
    return this.map.delete(key);
  }
}

export { YBoolean };
