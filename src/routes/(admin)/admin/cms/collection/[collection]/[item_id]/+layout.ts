import { invalidate } from '$app/navigation';
import { genAvatar } from '$utils';
import type { AwarenessUser } from '$utils/y/createYStore';
import arrayDifferences from 'array-differences';
import _ColorHash from 'color-hash';
import { copy } from 'copy-anything';
import type { LayoutLoad, LayoutParentData } from './$types';

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

  const docPermissions = {
    canRead: parsePermissions('read', permissions),
    canCreate: parsePermissions('create', permissions),
    canUpdate: parsePermissions('update', permissions),
    canPublish: parsePermissions('publish', permissions),
    canDelete: parsePermissions('delete', permissions),
    check: checkPermission.bind(null, permissions),
  };

  const actionInfo = { itemId: params.item_id, collection: params.collection, settings, session };
  const actions = {
    saveDoc: saveDoc.bind(null, actionInfo),
    cloneDoc: cloneDoc.bind(null, params.item_id),
    publishDoc: publishDoc.bind(null, actionInfo),
    unpublishDoc: unpublishDoc.bind(null, actionInfo),
    deleteDoc: deleteDoc.bind(null, params.item_id),
  };

  return { yuser, docPermissions, actions, session };
}) satisfies LayoutLoad;

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
  // showChevron?: boolean;
}

function checkPermission(
  permissions: LayoutParentData['permissions'],
  action: 'read' | 'create' | 'update' | 'publish' | 'delete',
  field?: string
) {
  const info = permissions.find(
    ({ action: a }) => a === `plugin::content-manager.explorer.${action}`
  );
  if (!info) return false;
  if (!field) return true;
  return info.properties.fields?.includes(field);
}

function parsePermissions(
  type: 'read' | 'create' | 'update' | 'publish' | 'delete',
  permissions: LayoutParentData['permissions']
) {
  const info = permissions.find(
    ({ action }) => action === `plugin::content-manager.explorer.${type}`
  );
  return !!info;
}

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
  // showChevron?: boolean;
}

interface ActionInfo {
  itemId: string;
  collection: string;
  settings: LayoutParentData['settings'];
  session: LayoutParentData['session'];
}

/**
 * This function sends a PUT request to the Strapi API to update the document.
 *
 * You must provide the `itemdId`, `collection`, `settings`, and `session` properties.
 *
 * `data` must be provided in the form of an object with `old` and `new` properties.
 * The `old` property should contain the original data of the document, and the `new` property
 * should contain the updated data. This means you need to preserve a copy of the original data
 * before making changes.
 */
async function saveDoc(
  { itemId, collection, settings, session }: ActionInfo,
  data: { old: any; new: any }
) {
  const updateData = copy(data.new);

  const relationFields = settings.defs
    .filter(([, def]) => def.type === 'relation')
    .map(([key]) => key);

  relationFields.forEach((key) => {
    const newRelationData = data.new[key];
    const oldRelationData = data.old[key];

    if (Array.isArray(newRelationData)) {
      const diff = arrayDifferences(
        oldRelationData?.map((d) => d.id).map(Number),
        newRelationData?.map((d) => d.id).map(Number)
      );
      if (diff.length === 0) {
        delete updateData[key];
      }
      const ids = newRelationData?.map((d) => d.id);
      // we first remove the ids from the relation so that
      // strapi forgets their placement, and then we send
      // the ids in reverse order since strapi automatically
      // reverses them
      updateData[key] = { disconnect: ids, set: ids.reverse() };
    } else {
      updateData[key] = newRelationData?.id ? parseInt(newRelationData.id) : null;
    }
  });

  return await fetch(`/admin/strapi/content-manager/collection-types/${collection}/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.adminToken}`,
    },
    body: JSON.stringify(updateData),
  })
    .then((res) => res.json())
    .finally(() => {
      invalidate('collection-item:page-load');
    });
}

function cloneDoc(itemId: string | number) {
  console.log('cloned');
}

async function publishDoc(
  { itemId, collection, session }: ActionInfo,
  { publishedAt, docData }: { publishedAt: string; docData: any }
) {
  return await fetch(
    `/admin/strapi/content-manager/collection-types/${collection}/${itemId}/actions/publish`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.adminToken}`,
      },
      body: JSON.stringify({ ...docData, publishedAt }),
    }
  )
    .then((res) => res.json())
    .finally(() => {
      invalidate('collection-item:page-load');
    });
}

async function unpublishDoc(
  { itemId, collection, session }: ActionInfo,
  { docData }: { docData: any }
) {
  return await fetch(
    `/admin/strapi/content-manager/collection-types/${collection}/${itemId}/actions/unpublish`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.adminToken}`,
      },
      body: JSON.stringify({ ...docData, publishedAt: null }),
    }
  )
    .then((res) => res.json())
    .finally(() => {
      invalidate('collection-item:page-load');
    });
}

function deleteDoc(itemId: string | number) {
  console.log('deleted');
}
