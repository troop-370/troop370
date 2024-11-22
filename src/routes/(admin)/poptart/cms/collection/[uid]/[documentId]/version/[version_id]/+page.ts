import { get, readable } from 'svelte/store';
import { createDocDataStore } from '../../createDocDataStore';
import { filterSchemaDefs } from '../../filterSchemaDefs';
import { loadPreviewConfig } from '../../loadPreviewConfig';
import type { PageLoad } from './$types';

export const load = (async ({ parent, params, fetch }) => {
  const { session, versions, collectionConfig, permissions } = await parent();

  const versionId = params.version_id;
  const version = get(versions)?.data?.data?.find((v) => v.id === Number(versionId));

  const defs = filterSchemaDefs(get(collectionConfig).defs, permissions, ['read']);

  const docData = version?.data || {};
  const docDataStore = createDocDataStore(docData);

  const previewConfig = readable(
    await loadPreviewConfig(fetch, session.adminToken, params.uid, docData)
  );

  return { version, docDataStore, previewConfig, defs };
}) satisfies PageLoad;
