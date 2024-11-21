import { error } from '@sveltejs/kit';
import { derived, get, writable } from 'svelte/store';
import type { PageLoad } from './$types';
import { createDocDataStore } from './createDocDataStore';
import { filterSchemaDefs } from './filterSchemaDefs';
import { getDocument, withDocumentRelationData } from './getDocument';
import { checkForUnsavedChanges, saveDocument } from './saveDocument';
export { isDocDataStore as _isDocDataStore } from './createDocDataStore';
export type { DocDataStore } from './createDocDataStore';

export const load = (async ({ fetch, parent, params }) => {
  const { session, collectionConfig, permissions } = await parent();

  const defs = filterSchemaDefs(get(collectionConfig).defs, permissions, ['read', 'update']);

  const queryProps = {
    fetch,
    session,
    collectionID: params.uid,
    documentId: params.documentId,
    defs,
  };

  let docData = await getDocument(queryProps).catch((err) => {
    error(500, err[0]);
  });

  const docDataStore = createDocDataStore(docData);

  const saving = writable(false);
  const save = async () => {
    // if the document is already saved, skip the save process
    // but make the user think it's saving
    if (get(saveStatus) === 'Saved') {
      saving.set(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      saving.set(false);
      return;
    }

    // otherwise, save the document and then update the docData state
    // so that the user's document is up to date
    saving.set(true);
    await saveDocument({ ...queryProps, docDataStore, originalDocData: docData })
      .then(async ([baseData]) => {
        docData = await withDocumentRelationData({ ...queryProps, baseData });
        docDataStore.set(docData);
      })
      .finally(() => {
        saving.set(false);
      });
  };

  const saveStatus = derived([docDataStore.docData, saving], ([$currentDocData, $saving]) => {
    if ($saving) return 'Saving…';

    const isUnsaved = checkForUnsavedChanges(docData, $currentDocData, defs);
    if (isUnsaved) return 'Unsaved changes';

    return 'Saved';
  });

  const actions = derived(
    [saveStatus],
    ([$saveStatus]): Action[] => {
      return [
        {
          id: 'save',
          label: 'Save',
          action: save,
          disabled: $saveStatus !== 'Unsaved changes',
          icon: 'Save24Regular',
        },
      ];
    },
    []
  );

  return { docData, docDataStore, save, saveStatus, defs, actions };
}) satisfies PageLoad;

export interface Action {
  id: string;
  label: string;
  icon?: string;
  action: (evt: MouseEvent | TouchEvent | KeyboardEvent | CustomEvent<any>) => void | Promise<void>;
  loading?: boolean;
  onAuxClick?: (evt: MouseEvent | CustomEvent<any>) => void;
  disabled?: boolean;
  tooltip?: string;
  hint?: string;
}
