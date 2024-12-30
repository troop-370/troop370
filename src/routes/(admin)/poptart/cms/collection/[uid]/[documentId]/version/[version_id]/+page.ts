import { hasKey } from '$utils';
import { error } from '@sveltejs/kit';
import { isObject } from 'is-what';
import { derived, get, readable } from 'svelte/store';
import { _calculateDefs } from '../../../+layout';
import { createDocDataStore } from '../../createDocDataStore';
import { filterSchemaDefs } from '../../filterSchemaDefs';
import { loadPreviewConfig } from '../../loadPreviewConfig';
import type { PageLoad } from './$types';

export const load = (async ({ parent, params, fetch, url }) => {
  const {
    session,
    versions,
    partialStrapiCollectionConfig,
    contentTypeSchema,
    permissions,
    contentManagerSettings,
  } = await parent();

  if (!contentManagerSettings) {
    error(404, 'Content Manager settings not found');
  }

  if (!partialStrapiCollectionConfig) {
    error(404, 'Partial Strapi collection config not found');
  }

  if (!get(contentTypeSchema)) {
    error(404, 'Content type schema not found');
  }

  const versionId = params.version_id;

  // if the store is loading, wait for it to finish
  while (get(versions)?.loading) {
    // wait for the store to update
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const version = get(versions)?.data?.data?.find((v) => v.id === Number(versionId));

  // create a new collectionConfig that uses the content type schema from when the version was created
  const collectionConfig = derived(
    [partialStrapiCollectionConfig, contentManagerSettings, contentTypeSchema],
    ([$partialStrapiCollectionConfig, $contentManagerSettings, $contentTypeSchema]) => {
      const currentSchema = $contentTypeSchema! || {};
      const versionSchema = {
        ...currentSchema,
        attributes: version?.schema || {},
      };

      const [defs, merged] = _calculateDefs({
        collectionUID: params.uid,
        $contentManagerSettings: {
          data: {
            docs: {
              components: $contentManagerSettings.data.docs.components,
              contentTypes: [versionSchema],
            },
          },
        },
        $collectionConfig: $partialStrapiCollectionConfig,
        previewRouteExists: false,
        inlinePreviewRouteExists: false,
        possiblePreviewRoute: '',
        possibleInlinePreviewRoute: '',
        url,
      });

      return { ...merged, defs };
    }
  );

  const defs = filterSchemaDefs(get(collectionConfig).defs, permissions, ['read']);

  const docData = Object.fromEntries(
    Object.entries(version?.data || {}).map(([key, value]) => {
      if (
        isObject(value) &&
        Object.keys(value).length === 2 &&
        hasKey(value, 'results') &&
        hasKey(value, 'meta')
      ) {
        return [key, value.results];
      }
      return [key, value];
    })
  );
  const docDataStore = createDocDataStore(docData);

  const previewConfig = readable(
    await loadPreviewConfig(fetch, session.adminToken, params.uid, docData)
  );

  return { version, docDataStore, previewConfig, defs, docData };
}) satisfies PageLoad;
