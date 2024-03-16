import { notEmpty } from '$utils';
import { queryWithStore } from '$utils/query';
import { deconstructSchema } from '$utils/y/deconstructSchema';
import { error } from '@sveltejs/kit';
import { derived, get } from 'svelte/store';
import { z } from 'zod';
import type { LayoutLoad } from './$types';

export const load = (async ({ fetch, parent, params }) => {
  const { session, contentManagerSettings, userPermissions, previewConfig } = await parent();
  if (!contentManagerSettings) throw error(404, 'failed to find content manager settings');

  const settings = get(contentManagerSettings)?.data?.docs?.contentTypes.find(
    (type) => type.uid === params.collection
  );
  if (!settings) throw error(404, 'failed to find content type settings');

  if (!userPermissions) throw error(404, 'failed to find user permissions');
  const permissions = get(userPermissions)?.raw.filter((p) => p.subject === params.collection);
  if (!settings) throw error(404, 'failed to find content type permissions');

  const collectionConfig = await queryWithStore<z.infer<typeof collectionConfigurationSchema>>({
    fetch,
    query: {
      location:
        '/admin/strapi/content-manager/content-types/' + params.collection + '/configuration',
      opName: `strapiContentTypeConfig_${params.collection}`,
      docsPath: 'data',
      paginationPath: '',
    },
    validator: collectionConfigurationSchema,
    Authorization: `Bearer ${session.adminToken}`,
    waitForQuery: true, // ensure that data is available before continuing since we need it in this function
    useCache: true,
    expireCache: 15 * 60 * 1000, // require refetch if it has been 15 minutes
  }).then((store) => {
    return derived([store], ([$store]) => {
      return $store.data?.docs;
    });
  });

  const defs = (() => {
    const $collectionConfig = get(collectionConfig);
    if (!$collectionConfig) return [];

    const fieldNames = $collectionConfig.contentType.layouts.edit.flat().map(({ name }) => name);
    const metadatas = Object.entries($collectionConfig.contentType.metadatas).map(
      ([key, value]) => [key, value.edit] as const
    );
    const attributes = Object.entries(settings.attributes);

    return fieldNames
      .map((key) => {
        const thisAttrs = attributes.find(([_key]) => _key === key);
        if (!thisAttrs) return;

        const thisMetadatas = metadatas.find(([_key]) => _key === key);
        if (!thisMetadatas) return;

        return [
          key,
          {
            ...thisAttrs[1],
            field: thisMetadatas[1],
          },
        ] as const;
      })
      .filter(notEmpty);
  })();

  const collectionPreviewConfig = get(previewConfig)?.find((config) => config.uid === settings.uid);

  const deconstructedSchema = deconstructSchema({
    name: { type: 'String' },
    ...Object.fromEntries(
      defs
        .map(([key, def]) => {
          if (def.type === 'blocks')
            return [
              key,
              {
                type: 'String',
                field: {
                  tiptap: {
                    features: {
                      bold: true,
                      italic: true,
                      underline: false,
                      strike: true,
                      bulletList: true,
                      orderedList: true,
                      textStylePicker: true,
                      horizontalRule: true,
                      link: true,
                    },
                  },
                },
              },
            ];
        })
        .filter(notEmpty)
    ),
  });

  return {
    settings: {
      ...settings,
      defs,
      preview: collectionPreviewConfig,
    },
    permissions,
    collectionConfig,
    deconstructedSchema,
  };
}) satisfies LayoutLoad;

const collectionConfigurationSchema = z.object({
  contentType: z.object({
    layouts: z.object({
      edit: z
        .object({
          name: z.string(),
          size: z.number(),
        })
        .array()
        .array(),
      list: z.string().array(),
    }),
    metadatas: z.record(
      z.string(),
      z.object({
        edit: z.object({
          description: z.string().optional(),
          editable: z.boolean().optional(),
          label: z.string().optional(),
          placeholder: z.string().optional(),
          visible: z.boolean().optional(),
        }),
        list: z.object({
          label: z.string(),
          searchable: z.boolean(),
          sortable: z.boolean(),
        }),
      })
    ),
    settings: z.object({
      bulkable: z.boolean(),
      defaultSortBy: z.string(),
      defaultSortOrder: z.string(),
      filterable: z.boolean(),
      mainField: z.string(),
      pageSize: z.number(),
      searchable: z.boolean(),
    }),
  }),
});
