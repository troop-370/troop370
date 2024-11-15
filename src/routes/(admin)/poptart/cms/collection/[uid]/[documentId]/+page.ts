import { get } from 'svelte/store';
import type { PageLoad } from './$types';
import { getDocument } from './getDocument';

export const load = (async ({ fetch, parent, params }) => {
  const { session, collectionConfig } = await parent();

  const docData = await getDocument({
    fetch,
    session,
    collectionID: params.uid,
    documentId: params.documentId,
    defs: get(collectionConfig).defs,
  });

  return { docData };
}) satisfies PageLoad;
