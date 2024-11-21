import { hasKey } from '$utils';
import { isWritableStore } from '$utils/isWritableStore';
import { copy } from 'copy-anything';
import { isArray, isObject, isString } from 'is-what';
import { derived, get, readable, writable, type Readable, type Writable } from 'svelte/store';

/**
 * A special writable store that contains nested objects as writable stores.
 */
export interface DocDataStore extends Writable<Record<string, DocDataStore | unknown>> {
  /**
   * Returns the value of the store with all nested writable stores as plain objects.
   */
  toObject: () => Record<string, unknown>;
  /**
   * A derived store that returns the value of the store with all nested writable stores as plain objects.
   *
   * This is the store version of the `toObject` method.
   */
  docData: Readable<Record<string, unknown>>;
}

export function createDocDataStore(docData: Record<string, unknown>): DocDataStore {
  /**
   * We keep this outside the function so that it is never overwritten with an empty state
   * due to the function being recursive.
   *
   * This is also ensures that stores are replaced with the latest version of the store.
   */
  const activeChildStoresMap = new Map<string, DocDataStore>();

  function internal_createDocDataStore(docData: Record<string, unknown>, level = 0) {
    const activeChildStores = writable(Array.from(activeChildStoresMap.values()));
    const docDataStore = writable(convertChildrenToWritableStores(docData));

    function convertChildrenToWritableStores(docData: Record<string, unknown>) {
      const data = copy(docData);

      Object.entries(data).forEach(([key, value]) => {
        // convert component objects to writable stores
        if (isObject(value) && !isWritableStore(value)) {
          const childStore = internal_createDocDataStore(value, level + 1);
          data[key] = childStore;
          activeChildStoresMap.set(key, childStore);
        }

        // convert dynamiczone array objects
        if (isComponentArray(value, 'partial')) {
          value.map((item, index) => {
            if (isObject(item) && !isWritableStore(item)) {
              const childStore = internal_createDocDataStore(item, level + 1);
              value[index] = childStore;
              activeChildStoresMap.set(`${key}[${index}]`, childStore);
            }
          });
        }
      });

      if (level === 0) {
        activeChildStores.set(Array.from(activeChildStoresMap.values()));
      }

      return data;
    }

    function set(newValue: Record<string, unknown>) {
      docDataStore.set(convertChildrenToWritableStores(newValue));
    }

    /**
     * Returns the docDataStore object value, including the nested writable stores as object values
     */
    function getPlainObjectValue() {
      const docData = copy(get(docDataStore));
      Object.entries(docData).forEach(([key, value]) => {
        if (isWritableStore(value)) {
          docData[key] = get(value);
        }
        if (isArray(value)) {
          value.map((item, index) => {
            if (isWritableStore(item)) {
              value[index] = get(item);
            }
          });
        }
      });
      return docData;
    }

    // The derived store that reacts to the values of the dynamic list of stores
    const derivedPlainObjectValue = readable<ReturnType<typeof getPlainObjectValue>>({}, (set) => {
      let unsubscribeFns: (() => void)[] = [];

      const updateSubscriptions = (stores: Readable<any>[]) => {
        // Clean up existing subscriptions
        unsubscribeFns.forEach((unsubscribe) => unsubscribe());
        unsubscribeFns = [];

        // Subscribe to new stores
        const values: any[] = new Array(stores.length);
        stores.forEach((store, index) => {
          unsubscribeFns.push(
            store.subscribe((value) => {
              values[index] = value;
              set(getPlainObjectValue()); // Emit the updated values
            })
          );
        });
      };

      // Subscribe to the dynamic list of stores
      const allStores = derived([docDataStore, activeChildStores], ([, stores]) => [
        docDataStore,
        ...stores,
      ]);
      const unsubscribeDynamic = allStores.subscribe(updateSubscriptions);

      // Cleanup all subscriptions when the readable is no longer needed
      return () => {
        unsubscribeFns.forEach((unsubscribe) => unsubscribe());
        unsubscribeDynamic();
      };
    });

    return {
      ...docDataStore,
      set,
      toObject: getPlainObjectValue,
      docData: derivedPlainObjectValue,
    };
  }

  return internal_createDocDataStore(docData);
}

function isComponentArray(value: unknown, strict: 'all' | 'partial' = 'all'): value is unknown[] {
  const condition = (item: unknown) =>
    isObject(item) && hasKey(item, '__component') && isString(item.__component);

  return isArray(value) && (strict === 'all' ? value.every(condition) : value.some(condition));
}

export function isDocDataStore(value: unknown): value is DocDataStore {
  return (
    isObject(value) &&
    isWritableStore(value) &&
    typeof value.toObject === 'function' &&
    hasKey(value, 'docData')
  );
}
