import type * as Y from 'yjs';
import type { FieldDef } from '../genSchema';

type UnpopulatedValue = { _id: string; label?: string; [key: string]: unknown };

/**
 * Reference fields are stored as an
 * array of objects containing a value,
 * label, and other optional metadata.
 *
 * The shared array if used for both single
 * references and arrays of references. The
 * UI clears the existing array values
 * when selecting on option in a field that
 * only allows one selection.
 */
class YReference<
  K extends string,
  V extends (string | undefined | null)[] | UnpopulatedValue[] | undefined | null
> {
  #ydoc: Y.Doc;

  constructor(ydoc: Y.Doc) {
    this.#ydoc = ydoc;
  }

  set(
    key: K,
    value: V,
    client?: unknown,
    reference?: FieldDef['reference']
  ): Record<string, unknown>[] {
    // get/create the shared type
    const type = this.#ydoc.getArray<Record<string, unknown>>(key);

    // convert all values into partially populated values
    let partiallyPopulated: UnpopulatedValue[] = [];

    value?.forEach((v) => {
      if (!v) return;
      if (typeof v === 'string') {
        partiallyPopulated.push({ _id: v });
      } else {
        partiallyPopulated.push({
          ...v,
          _id: (v[reference?.fields?._id || '_id'] as string | undefined) || v._id,
          label: (v[reference?.fields?.name || 'name'] as string | undefined) || v.label,
        });
      }
    });

    // // populate values
    // let populated: ReturnType<typeof populateReferenceValues> | undefined = undefined;
    // if (client && reference?.collection) {
    //   populated = populateReferenceValues(
    //     client,
    //     partiallyPopulated.filter((v) => !v.label),
    //     reference.collection,
    //     reference.fields
    //   );
    // }

    // this.#ydoc.transact(() => {
    //   // clear existing values
    //   type.delete(0, type.toArray()?.length);
    //   this.#deleteDocFieldShares(key);

    //   // push the partially populated values
    //   type.push(
    //     partiallyPopulated.map(({ _id, label, ...rest }) => {
    //       return { value: _id, label: label || _id, ...rest };
    //     })
    //   );
    // });

    // // replace with populated
    // // values once they load
    // if (populated) {
    //   populated.then((values) => {
    //     values.forEach(({ _id, label }) => {
    //       // ensure that the correct value is replaced
    //       // (in case the order of values has changed)
    //       const replaceIndex = type.toArray().findIndex(({ value }) => value === _id);
    //       if (replaceIndex !== -1) {
    //         this.#ydoc.transact(() => {
    //           type.delete(replaceIndex);
    //           type.insert(replaceIndex, [{ value: _id, label }]);
    //         });
    //       }
    //     });
    //   });
    // }

    // return the new value
    return type.toArray();
  }

  has(key: K): boolean {
    return this.#ydoc.share.has(key);
  }

  get(key: K): Record<string, 'value' | 'label' | unknown>[] {
    return this.#ydoc.getArray<Record<string, 'value' | 'label' | unknown>>(key).toArray();
  }

  delete(key: K): void {
    this.#ydoc.share.delete(key);
  }

  /**
   * remove shared types that were created as a result
   * of this docArray
   */
  #deleteDocFieldShares(key: K) {
    this.#ydoc.share.forEach((share, shareName) => {
      if (shareName.includes(`__docArray.‾‾${key}‾‾.`)) {
        this.#ydoc.share.delete(shareName);
      }
    });
  }
}

export { YReference };
