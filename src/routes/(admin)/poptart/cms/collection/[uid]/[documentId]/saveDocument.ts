import { getProperty, setProperty } from '$utils';
import { delProperty, hasProperty } from '$utils/objectPath';
import { copy } from 'copy-anything';
import { flattenObject } from 'flatten-anything';
import { isArray, isNumber, isObject } from 'is-what';
import { nestifyObject } from 'nestify-anything';
import type { SchemaDef } from '../+layout';
import type { DocDataStore } from './+page';
import { deconstructSchemaDefs } from './getDocument';

type Fetch = typeof fetch;

export interface SaveDocumentProps {
  fetch: Fetch;
  session: App.Locals['session']['data'];
  collectionID: string;
  documentId?: string;
  defs: SchemaDef[];
  originalDocData: Record<string, unknown>;
  docDataStore: DocDataStore;
  cloneMode?: boolean;
}

export async function saveDocument(
  props: SaveDocumentProps
): Promise<
  [
    Record<string, unknown> | undefined,
    Record<string, unknown> | undefined,
    Record<string, unknown> | undefined,
  ]
> {
  const { fetch, session, collectionID, documentId } = props;
  const docData = await prepDocument(props);

  // save the document
  const [baseData, metaData, errorData] = await fetch(
    `/strapi/content-manager/collection-types/${collectionID}${props.cloneMode ? '/clone' : ''}${documentId ? `/${documentId}` : ''}`,
    {
      method: documentId && !props.cloneMode ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.adminToken}`,
      },
      body: JSON.stringify(docData),
    }
  )
    .then((res) => res.json())
    .then((json) => {
      return [json.data, json.meta, json.error];
    });

  return [baseData, metaData, errorData];
}

export async function prepDocument(
  props: Pick<SaveDocumentProps, 'defs' | 'docDataStore' | 'originalDocData'>
) {
  const { defs, docDataStore, originalDocData } = props;
  const deconstructedSchemaDefs = deconstructSchemaDefs(defs);

  const docData = filterDataToEditableFields(docDataStore.toObject(), deconstructedSchemaDefs);

  // convert relations to connections/disconnections
  const connections = getRelationConnections(originalDocData, docData, deconstructedSchemaDefs);
  deconstructedSchemaDefs
    .filter(([, def]) => def.type === 'relation' && def.writable !== false)
    .forEach(([field, def]) => {
      const parentKey = field.split('.').slice(0, -1).join('.');
      if (!hasProperty(docData, parentKey)) {
        setProperty(docData, parentKey, null);
      }
      if (getProperty(docData, parentKey) === null) {
        return;
      }
      setProperty(docData, field, connections[field]);
    });

  // remove ids from dynamiczone data that start with NEW_
  const dynamicZoneFields = deconstructedSchemaDefs.filter(
    ([, def]) => def.type === 'dynamiczone' && def.writable !== false
  );
  dynamicZoneFields.forEach(([field]) => {
    const values = getProperty(docData, field);
    if (!isArray(values)) return;
    values.forEach((value) => {
      if (isObject(value) && value.id?.toString().startsWith('NEW_')) {
        delete value.id;
      }
    });
  });

  // remove ids that start with NEW_ from components
  // but looking through docData recursively to remove id fields
  const removeNewIds = (data: Record<string, unknown>) => {
    Object.keys(data).forEach((key) => {
      if (isObject(data[key])) {
        if (data[key].id?.toString().startsWith('NEW_')) {
          delete data[key].id;
        }
        removeNewIds(data[key] as Record<string, unknown>);
      }
    });
  };
  removeNewIds(docData);

  return docData;
}

function getRelationConnections(
  _originalDocData: Record<string, unknown>,
  _docData: Record<string, unknown>,
  deconstructedSchemaDefs: SchemaDef[]
) {
  const originalDocData = filterDataToEditableFields(_originalDocData, deconstructedSchemaDefs);
  const docData = filterDataToEditableFields(_docData, deconstructedSchemaDefs);

  const connections = deconstructedSchemaDefs
    .filter(([, def]) => def.type === 'relation' && def.writable !== false)
    .reduce(
      (acc, [field, def]) => {
        const newData = getProperty(docData, field);
        if (!newData) return acc;

        const originalDocuments = parseRelationValues(getProperty(originalDocData, field));
        const newDocuments = parseRelationValues(newData);

        const isChanged =
          originalDocuments.length !== newDocuments.length ||
          originalDocuments.some(
            (origDoc, idx) => origDoc.documentId !== (newDocuments[idx]?.documentId || '')
          );

        // this is supposed to work, but strapi was deleting all the relations instead
        // if (!isChanged) {
        //   acc[field] = { connect: [], disconnect: [] };
        //   return acc;
        // }

        // build the `set` array with positional information
        const setDocuments = newDocuments.map((doc, index) => {
          if (index === 0) {
            return { ...doc, start: true };
          } else if (index === newDocuments.length - 1) {
            return { ...doc, end: true };
          } else {
            return { ...doc, after: newDocuments[index - 1].documentId };
          }
        });

        // this is supposed to work in all cases, but cloning a doc in the current strapi version
        // is requiring the 'set' array to be provided with the property
        // acc[field] = { set: setDocuments };
        acc[field] = setDocuments;
        return acc;
      },
      {} as Record<
        string,
        // see above for why this is commented out
        // {
        //   set?: ReturnType<typeof parseRelationValues>;
        //   connect?: [];
        //   disconnect?: [];
        // }
        ReturnType<typeof parseRelationValues>
      >
    );

  return connections;
}

function parseRelationValues(values: unknown[]) {
  if (!isArray(values) || !values.every(isObject)) return [];
  return values.map((value) => ({
    id: isNumber(value.id) ? value.id : parseInt(`${value.id}`),
    documentId: value.documentId as string,
  }));
}

function filterDataToEditableFields(
  _docData: Record<string, unknown>,
  deconstructedSchemaDefs: ReturnType<typeof deconstructSchemaDefs>
) {
  let docData = copy(_docData);

  // remove all fields not in the schema
  docData = flattenObject(docData);
  Object.keys(docData).forEach((field) => {
    if (!deconstructedSchemaDefs.some(([defField]) => defField === field)) {
      delProperty(docData, field);
    }
  });
  docData = nestifyObject(docData);

  // remove all non-writable fields
  deconstructedSchemaDefs
    .filter(([, def]) => def.writable === false)
    .forEach(([field]) => {
      delProperty(docData, field);
    });

  // remove system fields
  const systemFields = ['id', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy'];
  systemFields.forEach((field) => {
    delProperty(docData, field);
  });

  // remove extra properties from relation data since they cannot be saved
  deconstructedSchemaDefs
    .filter(([, def]) => def.type === 'relation' && def.writable !== false)
    .forEach(([field]) => {
      const relationData = getProperty(docData, field);
      if (!relationData) {
        return;
      }

      const documents = parseRelationValues(relationData);
      setProperty(docData, field, documents);
    });

  // remove extra properties from media fields
  deconstructedSchemaDefs
    .filter(([, def]) => def.type === 'media' && def.writable !== false)
    .forEach(([field]) => {
      const data = getProperty(docData, field);

      if (data) {
        setProperty(docData, field, { id: data.id, documentId: data.documentId });
      }
    });

  // remove ids from components
  deconstructedSchemaDefs
    .filter(([field, def]) => def.type === 'integer' && !!def.componentId && field.endsWith('.id'))
    .forEach(([field]) => {
      delProperty(docData, field);
    });

  // remove ids from dynamiczone data
  deconstructedSchemaDefs
    .filter(([field, def]) => def.type === 'dynamiczone' && def.writable !== false)
    .forEach(([field]) => {
      const values = getProperty(docData, field);
      if (!isArray(values)) return;

      values.forEach((value) => {
        if (isObject(value) && value.id) {
          delete value.id;
        }
      });
    });

  return docData;
}

export function checkForUnsavedChanges<T extends Record<string, unknown>>(
  originalDocData: T,
  currentDocData: T,
  defs: SchemaDef[]
) {
  const deconstructedSchemaDefs = deconstructSchemaDefs(defs);

  const originalDocDataFiltered = filterDataToEditableFields(
    originalDocData,
    deconstructedSchemaDefs
  );
  const currentDocDataFiltered = filterDataToEditableFields(
    currentDocData,
    deconstructedSchemaDefs
  );

  const originalDocDataString = JSON.stringify(originalDocDataFiltered);
  const currentDocDataString = JSON.stringify(currentDocDataFiltered);

  return originalDocDataString !== currentDocDataString;
}
