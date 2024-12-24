import { isModernCollection, strapiEditor } from '$stores/strapiEditor';
import { isURL } from '$utils';
import { openWindow } from '$utils/openWindow';
import { get } from 'svelte/store';
import type { GetReferenceOptions } from './getReferenceOptions';

export function handleOpenReference(_id: string, referenceOpts: GetReferenceOptions) {
  let $strapiEditor = get(strapiEditor);
  strapiEditor.subscribe((value) => {
    $strapiEditor = value;
  });

  if (isURL(_id)) {
    openWindow(_id, referenceOpts?.targetCollectionUid + _id, 'location=no');
  } else if (referenceOpts?.targetCollectionUid.toLowerCase() === 'plugin::upload.folder') {
    openWindow(
      `/admin/plugins/upload?folder=${_id}?childWindow=1`,
      referenceOpts?.targetCollectionUid + _id,
      'location=no'
    );
  } else if ($strapiEditor || !isModernCollection(referenceOpts?.targetCollectionUid)) {
    openWindow(
      `/admin/content-manager/collection-types/${referenceOpts?.targetCollectionUid}/${_id}?childWindow=1`,
      referenceOpts?.targetCollectionUid + _id,
      'location=no'
    );
  } else {
    openWindow(
      `/admin/cms/collection/${referenceOpts?.targetCollectionUid}/${_id}?childWindow=1`,
      referenceOpts?.targetCollectionUid + _id,
      'location=no'
    );
  }
}
