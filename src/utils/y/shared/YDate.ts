import type * as Y from 'yjs';

/**
 * Dates are stored in a shared text type.
 * Each field has it's own shared text type attached
 * to the yjs document.
 *
 * Date fields do not allow modifying individual characters,
 * so the entire text in the shared type is replaced.
 * (this is what happens in the UI when a date is changed.)
 */
class YDate<K extends string, V extends string | undefined | null> {
  #ydoc: Y.Doc;

  constructor(ydoc: Y.Doc) {
    this.#ydoc = ydoc;
  }

  set(key: K, value: V): string {
    // get/create the shared type
    const type = this.#ydoc.getText(key);

    this.#ydoc.transact(() => {
      // clear existing value
      type.delete(0, type.toJSON()?.length);

      // insert ISO date string value
      if (isIsoDate(value) && value !== '0001-01-01T01:00:00.000Z') {
        type.insert(0, value);
      }
    });

    // return the new value of the shared type
    return type.toJSON();
  }

  has(key: K): boolean {
    return this.#ydoc.share.has(key);
  }

  get(key: K): string {
    return this.#ydoc.getText(key).toJSON();
  }

  delete(key: K): void {
    this.#ydoc.share.delete(key);
  }
}

/**
 * Whether the input is an ISO 8601 date string.
 */
function isIsoDate(toCheck: unknown): toCheck is string {
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}:\d{2})$/;
  return typeof toCheck === 'string' && iso8601Regex.test(toCheck);
}

export { YDate };
