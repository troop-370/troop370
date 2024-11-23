import { getProperty } from '$utils';
import { deconstructSchemaDefs } from './getDocument';
import { prepDocument, type SaveDocumentProps } from './saveDocument';

interface PublishDocumentProps extends SaveDocumentProps {}

export async function publishDocument(
  props: PublishDocumentProps
): Promise<
  [
    Record<string, unknown> | undefined,
    Record<string, unknown> | undefined,
    Record<string, unknown> | undefined,
  ]
> {
  const { fetch, session, collectionID, documentId, defs } = props;
  const docData = await prepDocument(props);

  // convfirm that the required fields have values
  const deconstructedSchemaDefs = deconstructSchemaDefs(defs);
  const requiredFields = deconstructedSchemaDefs.filter(
    ([, def]) => def.required && def.type !== 'boolean'
  );
  const missingFields = requiredFields.filter(([field]) => !getProperty(docData, field));
  if (missingFields.length) {
    throw new Error(
      `MISSING_FIELDS:${missingFields.map(([field, def]) => def.label || field).join(', ')}`
    );
  }

  // publish the document
  const [baseData, metaData, errorData] = await fetch(
    `/strapi/content-manager/collection-types/${collectionID}/${documentId}/actions/publish`,
    {
      method: 'POST',
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
