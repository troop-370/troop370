export async function loadPreviewConfig(
  fetch: typeof window.fetch,
  adminToken: string | undefined,
  collectionUID: string,
  docData: Record<string, unknown>
) {
  const previewConfig = await fetch(`/strapi/preview-button/config`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      return data?.config?.contentTypes?.find((contentType) => contentType.uid === collectionUID);
    })
    .then((preview) => {
      if (!preview) return;

      function replaceVariables(str: string) {
        return str.replace(/{([^}]+)}/g, (_, key) => {
          return docData[key];
        });
      }

      const publishedSearchParams = new URLSearchParams('');
      if (preview.published.query) {
        Object.entries(preview.published.query).forEach(([key, value]) => {
          publishedSearchParams.append(key, replaceVariables(value));
        });
      }

      const draftSearchParams = new URLSearchParams('');
      if (preview.draft.query) {
        Object.entries(preview.draft.query).forEach(([key, value]) => {
          draftSearchParams.append(key, replaceVariables(value));
        });
      }

      return {
        published: `${replaceVariables(preview.published.url)}?${publishedSearchParams.toString()}`,
        draft: `${replaceVariables(preview.draft.url)}?${draftSearchParams.toString()}`,
      };
    });

  return previewConfig;
}
