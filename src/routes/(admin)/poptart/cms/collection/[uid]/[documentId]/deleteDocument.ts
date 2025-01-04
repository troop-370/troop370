import { type SaveDocumentProps } from './saveDocument';

interface DeleteDocumentProps
  extends Pick<SaveDocumentProps, 'fetch' | 'session' | 'collectionID'> {
  documentIds: string[];
}

export async function deleteDocument(props: DeleteDocumentProps) {
  const { fetch, session, collectionID, documentIds } = props;

  // group into batches of 10
  const batches: string[][] = [];
  let batch: string[] = [];
  for (const documentId of documentIds) {
    batch.push(documentId);
    if (batch.length === 10) {
      batches.push(batch);
      batch = [];
    }
  }

  if (batch.length) {
    batches.push(batch);
    batch = [];
  }

  // track success of each document deletion
  const report: Record<string, boolean | string> = {};

  // delete each batch
  for (const batch of batches) {
    await Promise.all(
      batch.map(async (documentId) => {
        const success = await fetch(
          `/strapi/content-manager/collection-types/${collectionID}/${documentId}?locale=*`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.adminToken}`,
            },
          }
        ).then(async (res) => {
          if (res.status === 200) {
            return true;
          }
          return await res.json().then((json) => {
            return json.error?.message || 'An unknown error occurred while deleting the document.';
          });
        });

        report[documentId] = success;
      })
    );
  }

  const failures = Object.entries(report).filter(([_, success]) => success !== true);

  if (failures.length) {
    return {
      success: false,
      failures,
    };
  }

  return {
    success: true,
  };
}
