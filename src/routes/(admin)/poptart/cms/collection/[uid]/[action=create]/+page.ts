import { goto } from '$app/navigation';
import { error } from '@sveltejs/kit';
import { get, writable } from 'svelte/store';
import { createDocDataStore } from '../[documentId]/createDocDataStore';
import { filterSchemaDefs } from '../[documentId]/filterSchemaDefs';
import { getDocument } from '../[documentId]/getDocument';
import { saveDocument } from '../[documentId]/saveDocument';
import type { PageLoad } from './$types';
export { isDocDataStore as _isDocDataStore } from '../[documentId]/createDocDataStore';
export type { DocDataStore } from '../[documentId]/createDocDataStore';

export const load = (async ({ fetch, parent, params, url }) => {
  const { session, collectionConfig, permissions } = await parent();

  const defs = filterSchemaDefs(get(collectionConfig).defs, permissions, ['create']);

  const queryProps = {
    fetch,
    session,
    collectionID: params.uid,
    defs,
  };

  const initialDocData = await (async () => {
    // for create mode, we need to initialize the docDataStore with null values
    // for components and empty arrays for dynamiczones
    // TODO: make this work with nested components and dynamiczones
    if (params.action === 'create') {
      return defs.reduce(
        (acc, _) => {
          const [key, def] = _;
          if (def.type === 'component') {
            acc[key] = null;
          }
          if (def.type === 'dynamiczone') {
            acc[key] = [];
          }
          if (def.default !== undefined) {
            acc[key] = def.default;
          }
          return acc;
        },
        {} as Record<string, unknown>
      );
    }

    // for clone mode, we need to fetch the document data of the doc to be cloned
    // and initialize the docDataStore with the fetched data
    if (params.action === 'clone') {
      const documentId = url.searchParams.get('from');
      if (!documentId) error(400, 'Missing documentId query parameter');

      const doc = await getDocument({ ...queryProps, documentId });
      if (!doc) error(404, 'Document to clone not found');

      return doc;
    }

    error(400, 'Invalid action');
  })();

  const docDataStore = createDocDataStore(initialDocData);

  const saving = writable(false);
  const save = async () => {
    saving.set(true);
    await saveDocument({
      ...queryProps,
      docDataStore,
      originalDocData: initialDocData,
      cloneMode: params.action === 'clone',
    })
      .then(async ([baseData]) => {
        goto(`./${baseData.documentId}`);
      })
      .finally(() => {
        saving.set(false);
      });
  };

  return { docDataStore, save, saving, defs, action: params.action };
}) satisfies PageLoad;
