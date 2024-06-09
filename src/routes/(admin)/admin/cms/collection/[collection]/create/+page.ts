import { query } from '$utils/query';
import { z } from 'zod';
import type { PageLoad } from './$types';

export const load = (async ({ fetch, params, parent, url, depends }) => {
  const { session, settings } = await parent();
  depends('collection-item:page-load');

  const item_id = url.searchParams.get('clone');
  let initialDocData: any | null = null;
  if (item_id) {
    initialDocData = await query<any>({
      fetch,
      query: {
        location:
          '/admin/strapi/content-manager/collection-types/' + params.collection + '/' + item_id,
        opName: `collectionItemData__${params.collection}__${item_id}`,
        docsPath: '',
      },
      Authorization: `Bearer ${session.adminToken}`,
      validator: z.any(),
    }).then((res) => res?.data?.docs);

    await Promise.all(
      settings.defs
        .filter(([, def]) => def.type === 'relation')
        .map(async ([key, def]) => {
          const relationData = await query<any>({
            fetch,
            query: {
              location: `/admin/strapi/content-manager/relations/${params.collection}/${item_id}/${key}`,
              opName: `collectionItemData__${params.collection}__${item_id}`,
              docsPath: def.relationType === 'oneToOne' ? 'data' : 'results',
            },
            variables: {
              pageSize: 100,
            },
            Authorization: `Bearer ${session.adminToken}`,
            validator: z.any(),
          }).then((res) => res?.data?.docs);

          initialDocData[key] = relationData;
        })
    );

    initialDocData.id = undefined;
    initialDocData.shortPublishedAt = undefined;
    initialDocData.previewId = undefined;
    initialDocData.object_id = undefined;
  }

  const uniqueFields = settings.defs
    .filter(([, def]) => def.unique || def.type === 'uid')
    .map(([key]) => key);
  if (uniqueFields.length > 0 && initialDocData) {
    uniqueFields.forEach((key) => {
      initialDocData[key] = undefined;
    });
  }

  return {
    url,
    initialDocData,
    params,
    uniqueFields,
  };
}) satisfies PageLoad;
