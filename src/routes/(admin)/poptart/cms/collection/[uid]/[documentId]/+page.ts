import { invalidate } from '$app/navigation';
import { error } from '@sveltejs/kit';
import { isFullArray, isFullObject, isString } from 'is-what';
import { derived, get, writable, type Writable } from 'svelte/store';
import type { PageLoad } from './$types';
import { createDocDataStore } from './createDocDataStore';
import { filterSchemaDefs } from './filterSchemaDefs';
import { deconstructSchemaDefs, getDocument, withDocumentRelationData } from './getDocument';
import { loadPreviewConfig } from './loadPreviewConfig';
import { publishDocument } from './publishDocument';
import { checkForUnsavedChanges, saveDocument } from './saveDocument';
import { setDocumentStage } from './setDocumentStage';
export { isDocDataStore as _isDocDataStore } from './createDocDataStore';
export type { DocDataStore } from './createDocDataStore';

export const load = (async ({ fetch, parent, params, url }) => {
  const { session, collectionConfig, permissions, versions, stages } = await parent();

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

  const settingStage = writable(false);
  const setStage = async (stage: number) => {
    settingStage.set(true);
    return await setDocumentStage({ ...queryProps, stage })
      .then(([baseData]) => {
        if (baseData) {
          ((get(docDataStore).strapi_stage as Writable<unknown>) || undefined)?.set?.(
            baseData.strapi_stage
          );
        }

        return true;
      })
      .catch((err) => {
        return (
          err.message ||
          'An unknown error occurred while changing the review workflwo stage for the document.'
        );
      })
      .finally(() => {
        settingStage.set(false);

        console.log('setting stage done');
      });
  };

  settingStage.subscribe((val) => {
    console.log('setting stage', val);
  });

  async function processSaveResponse([baseData, , errorData]: [
    Record<string, unknown> | undefined,
    Record<string, unknown> | undefined,
    Record<string, unknown> | undefined,
  ]) {
    if (errorData) {
      const message = (() => {
        if (
          isFullObject(errorData.details) &&
          isFullArray(errorData.details.errors) &&
          isFullObject(errorData.details.errors[0]) &&
          isString(errorData.details.errors[0].message)
        ) {
          const message = errorData.details.errors[0].message;
          const path = errorData.details.errors[0].path;
          if (!isFullArray(path)) return message;
          if (message.startsWith('This attribute')) {
            const deconstructedSchemaDefs = deconstructSchemaDefs(defs);
            // TODO: confirm that this works for nested fields (I do not know the structure of the path array)
            const foundDef = deconstructedSchemaDefs.find(([field]) => field === path.join('.'));
            if (foundDef) {
              const newMessage = message.replace(
                'This attribute',
                `The field "${foundDef?.[1].label || foundDef?.[0]}"`
              );
              return newMessage + '.';
            }
          }
          return message + (path.length > 0 ? ` (Field: ${path.join('.')}).` : '');
        }
        if (isString(errorData.message)) return errorData.message;
        return 'An unknown error occurred while saving the document.';
      })();
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
    [docDataStore.docData, saving, publishing, settingStage],
    ([$currentDocData, $saving, $publishing, $settingStage]) => {
      console.log($settingStage);
      if ($publishing) return 'Publishing…';
      if ($settingStage) return 'Setting stage…';
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

  // combine the available stages and the current stage to get a full list of stages
  const fullStages = derived([stages, docDataStore], ([$stages, $docDataStore]) => {
    if (!$stages.data || $stages.loading || !$docDataStore?.strapi_stage) return [];
    const otherStages = $stages.data.data;
    const currentStage = (
      $docDataStore.strapi_stage as any
    )?.toObject?.() as (typeof otherStages)[0];
    // TODO: figure out how to insert the current stage in the correct position
    return [...otherStages, currentStage]
      .map((stage) => {
        const customIdMatcher = stage.name.match(/\[(\d+(\.\d+)?)\]/);

        return {
          _id: customIdMatcher?.[1] || `s${stage.id}`,
          label: `${stage.name.replace(customIdMatcher?.[0] || '', '')}`,
          strapiStageId: stage.id,
          sortId: customIdMatcher?.[1] ? customIdMatcher[1] : '',
        };
      })
      .sort((a, b) => a.sortId.localeCompare(b.sortId));
  });

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
    stages: fullStages,
    setStage,
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
