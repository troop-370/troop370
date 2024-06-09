import { genAvatar } from '$utils';
import type { AwarenessUser } from '$utils/y/createYStore';
import _ColorHash from 'color-hash';
import { copy } from 'copy-anything';
import { _checkPermission, type ActionInfo } from '../[item_id]/+layout';
import type { LayoutLoad } from './$types';

// @ts-expect-error https://github.com/zenozeng/color-hash/issues/42
const ColorHash: typeof _ColorHash = _ColorHash.default || _ColorHash;
// @ts-expect-error 'bkdr' is a vlid hash config value
const colorHash = new ColorHash({ saturation: 0.8, lightness: 0.34, hash: 'bkdr' });

export const load = (async ({ parent, params }) => {
  const { session, permissions, settings } = await parent();

  // create a user object for the current user (for yjs)
  const yuser = {
    name: session.adminUser?.firstname + '' + session.adminUser?.lastname,
    color: colorHash.hex(`${session.adminUser?.id || session.adminEmail}`),
    sessionId: '',
    _id: `${session.adminUser?.id || session.adminEmail}`,
    photo: genAvatar(`${session.adminUser?.id || session.adminEmail}`),
  } satisfies AwarenessUser;

  return {
    yuser,
    checkPermissions: _checkPermission.bind(null, permissions),
    session,
    actions: {
      createDoc: createDoc.bind(null, { collection: params.collection, settings, session }),
    },
  };
}) satisfies LayoutLoad;

/**
 * This function sends a PUT request to the Strapi API to create a new document.
 *
 * You must provide the `itemdId`, `collection`, `settings`, and `session` properties.
 *
 * `data` must be provided in the form of an object with `old` and `new` properties.
 * The `old` property should contain the original data of the document, and the `new` property
 * should contain the updated data. This means you need to preserve a copy of the original data
 * before making changes.
 */
async function createDoc(
  { collection, settings, session }: Omit<ActionInfo, 'itemId'>,
  data: { data: any }
) {
  const createData = copy(data.data);

  const relationFields = settings.defs
    .filter(([, def]) => def.type === 'relation')
    .map(([key]) => key);

  relationFields.forEach((key) => {
    const relationData = data.data[key];

    if (Array.isArray(relationData)) {
      const ids = relationData?.map((d) => d.id);
      // we first remove the ids from the relation so that
      // strapi forgets their placement, and then we send
      // the ids in reverse order since strapi automatically
      // reverses them
      createData[key] = { disconnect: ids, set: ids.reverse() };
    } else {
      createData[key] = relationData?.id ? parseInt(relationData.id) : null;
    }
  });

  return await fetch(`/admin/strapi/content-manager/collection-types/${collection}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.adminToken}`,
    },
    body: JSON.stringify(createData),
  }).then((res) => res.json());
}
