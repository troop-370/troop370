import { query } from '$utils/query';
import { z } from 'zod';
import type { PageLoad } from './$types';

export const load = (async ({ fetch, params, parent, url }) => {
  const { session, settings } = await parent();

  const docData = await query<any>({
    fetch,
    query: {
      location:
        '/admin/strapi/content-manager/collection-types/' +
        params.collection +
        '/' +
        params.item_id,
      opName: `collectionItemData__${params.collection}__${params.item_id}`,
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
            location: `/admin/strapi/content-manager/relations/${params.collection}/${params.item_id}/${key}`,
            opName: `collectionItemData__${params.collection}__${params.item_id}`,
            docsPath: def.relationType === 'oneToOne' ? 'data' : 'results',
          },
          variables: {
            pageSize: 100,
          },
          Authorization: `Bearer ${session.adminToken}`,
          validator: z.any(),
        }).then((res) => res?.data?.docs);

        docData[key] = relationData;
      })
  );

  return {
    url,
    docData,
    params,
  };
}) satisfies PageLoad;
