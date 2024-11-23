import { invalidate } from '$app/navigation';
import { error } from '@sveltejs/kit';
import { isString } from 'is-what';
import { derived, get, writable } from 'svelte/store';
import type { PageLoad } from './$types';
import { createDocDataStore } from './createDocDataStore';
import { filterSchemaDefs } from './filterSchemaDefs';
import { getDocument, withDocumentRelationData } from './getDocument';
import { loadPreviewConfig } from './loadPreviewConfig';
import { publishDocument } from './publishDocument';
import { checkForUnsavedChanges, saveDocument } from './saveDocument';
export { isDocDataStore as _isDocDataStore } from './createDocDataStore';
export type { DocDataStore } from './createDocDataStore';

export const load = (async ({ fetch, parent, params, url }) => {
  const { session, collectionConfig, permissions, versions } = await parent();

  const defs = filterSchemaDefs(get(collectionConfig).defs, permissions, ['read', 'update']);

  const queryProps = {
    fetch,
    session,
    collectionID: params.uid,
    documentId: params.documentId,
    defs,
  };

  let docData = await getDocument(queryProps, url.searchParams.get('status') || '').catch((err) => {
    error(500, err[0]);
  });

  const docDataStore = createDocDataStore(docData);

  const previewConfig = writable(
    await loadPreviewConfig(fetch, session.adminToken, params.uid, docData)
  );

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
      .then(processSaveResponse)

      .finally(() => {
        saving.set(false);
      });
  };

  const publishing = writable(false);
  const publish = async () => {
    publishing.set(true);
    return await publishDocument({ ...queryProps, docDataStore, originalDocData: docData })
      .then(processSaveResponse)
      .then(() => {
        return true;
      })
      .catch((err) => {
        return err.message || 'An unknown error occurred while saving the document.';
      })
      .finally(() => {
        publishing.set(false);
      });
  };

  async function processSaveResponse([baseData, , errorData]: [
    Record<string, unknown> | undefined,
    Record<string, unknown> | undefined,
    Record<string, unknown> | undefined,
  ]) {
    if (errorData) {
      const message =
        errorData.message && isString(errorData.message)
          ? errorData.message
          : 'An unknown error occurred while saving the document.';
      throw new Error(message);
    }
    if (!baseData) {
      throw new Error('No data were returned from the server after saving the document.');
    }
    docData = await withDocumentRelationData({ ...queryProps, baseData });
    docDataStore.set(docData);
    updatePreviewConfig(docData);
    updateVersionsList();
  }

  async function updatePreviewConfig(docData: Record<string, unknown>) {
    const updatedPreviewConfig = await loadPreviewConfig(
      fetch,
      session.adminToken,
      params.uid,
      docData
    );
    if (updatedPreviewConfig) previewConfig.set(updatedPreviewConfig);
  }

  async function updateVersionsList() {
    versions.update((prev) => ({ ...prev, refetchOnInvalidate: true }));
    invalidate('document:versions');
  }

  const saveStatus = derived(
    [docDataStore.docData, saving, publishing],
    ([$currentDocData, $saving, $publishing]) => {
      if ($publishing) return 'Publishing…';
      if ($saving) return 'Saving…';

      const isUnsaved = checkForUnsavedChanges(docData, $currentDocData, defs);
      if (isUnsaved) return 'Unsaved changes';

      return 'Saved';
    }
  );

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

  return {
    docData,
    docDataStore,
    save,
    publish,
    saveStatus,
    defs,
    actions,
    isPublishedVersion: url.searchParams.get('status') === 'published',
    previewConfig,
  };
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
