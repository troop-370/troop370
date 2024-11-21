import { getProperty, notEmpty, setProperty } from '$utils';
import { merge } from 'merge-anything';
import type { SchemaDef } from '../+layout';

type Fetch = typeof fetch;

interface GetDocumentProps {
  fetch: Fetch;
  session: App.Locals['session']['data'];
  collectionID: string;
  documentId: string;
  defs: SchemaDef[];
}

export async function getDocument(props: GetDocumentProps): Promise<Record<string, unknown>> {
  const { fetch, session, collectionID, documentId } = props;

  const [baseData, metaData] = await fetch(
    `/strapi/content-manager/collection-types/${collectionID}/${documentId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.adminToken}`,
      },
    }
  )
    .then((res) => res.json())
    .then((json) => {
      if (json.data === null && json.error) {
        throw ['NO_PERMISSION', json.error];
      }
      return [json.data, json.meta];
    });

  return withDocumentRelationData({ ...props, baseData });
}

interface WithDocumentRelationDataProps extends GetDocumentProps {
  baseData: Record<string, unknown>;
}

export async function withDocumentRelationData(props: WithDocumentRelationDataProps) {
  const { documentId, defs, baseData } = props;
  const deconstructedSchemaDefs = deconstructSchemaDefs(defs);

  const flatRelationData = Object.fromEntries(
    await Promise.all(
      deconstructedSchemaDefs
        .filter(([, def]) => def.type === 'relation' && def.writable !== false)
        .map(async ([field, def]) => {
          const parentKey = field.split('.').slice(0, -1).join('.');
          const parentData = getProperty(baseData, parentKey);

          // if the parent data is null, we don't need to fetch the relation data
          // because it's not going to be used
          if (parentData === null) return null;

          const componentDocumentIdNumber = def.componentId ? parentData?.id : undefined;

          const [results] = await getDocumentRelation(
            {
              ...props,
              collectionID: def.componentId || props.collectionID,
              documentId: componentDocumentIdNumber || documentId,
            },
            field.split('.').slice(-1)[0]
          );
          return [field, results] as const;
        })
        .filter(notEmpty)
    ).then((results) => results.filter(notEmpty))
  );
  const relationData = {};
  Object.entries(flatRelationData).forEach(([field, data]) => {
    setProperty(relationData, field, data);
  });

  return merge(baseData, relationData);
}

/**
 * Flattens the schemaDefinitions.
 * Components and dynamic zones are flattened into their child schema definitions.
 *
 * Note: This does NOT make a deep copy of the schema definitions.
 */
export function deconstructSchemaDefs(
  defs: SchemaDef[],
  parentKey = '',
  componentId = ''
): DeconstructedSchemaDefs {
  return defs.flatMap(([field, def]) => {
    const fullField = parentKey ? `${parentKey}.${field}` : field;
    if (componentId) {
      def = { ...def, componentId } as DeconstructedSchemaDefs[0][1];
    }

    if (def.type === 'component' && def.componentDefs) {
      return deconstructSchemaDefs(def.componentDefs, fullField, def.component);
    }

    return [[fullField, def]];
  });
}
type DeconstructedSchemaDefs = [SchemaDef[0], SchemaDef[1] & { componentId?: string }][];

async function getDocumentRelation(props: GetDocumentProps, field: string) {
  const { fetch, session, collectionID, documentId, defs } = props;

  return await fetch(
    `/strapi/content-manager/relations/${collectionID}/${documentId}/${field}?pageSize=100&page=1`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.adminToken}`,
      },
    }
  )
    .then((res) => res.json())
    .then((json) => {
      return [json.results, json.pagination] as const;
    });
}
