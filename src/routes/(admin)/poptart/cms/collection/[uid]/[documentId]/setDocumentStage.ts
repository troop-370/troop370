import type { SchemaDef } from '../+layout';

type Fetch = typeof fetch;

export interface SetDocumentStageProps {
  fetch: Fetch;
  session: App.Locals['session']['data'];
  collectionID: string;
  documentId: string;
  defs: SchemaDef[];
  stage: number;
}

/**
 * Sets the stage of the document.
 */
export async function setDocumentStage(
  props: SetDocumentStageProps
): Promise<
  [
    Record<string, unknown> | undefined,
    Record<string, unknown> | undefined,
    Record<string, unknown> | undefined,
  ]
> {
  const { fetch, session, collectionID, documentId, stage } = props;

  const [baseData, metaData, errorData] = await fetch(
    `/strapi/review-workflows/content-manager/collection-types/${collectionID}/${documentId}/stage`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.adminToken}`,
      },
      body: JSON.stringify({ data: { id: stage } }),
    }
  )
    .then((res) => res.json())
    .then((json) => {
      return [json.data, json.meta, json.error];
    });

  return [baseData, metaData, errorData];
}
