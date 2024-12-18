import { PUBLIC_API_URL } from '$env/static/public';
import { paramsToStrapiFilter } from '$utils';
import { queryWithStore } from '$utils/query';
import { derived } from 'svelte/store';
import { z } from 'zod';

export interface GetFileExplorerDataParams {
  session: Partial<SessionData>;
  fetch: typeof fetch;
  url: URL;
  path: {
    folder: number;
    folderPath: string;
    breadcrumbs: string;
    folderNumberPath: string;
  };
  search?: string;
  /**
   * Restrict the file types that appear in the file explorer
   * by providing the mime types for the approved file types
   */
  mimes?: string[];
}

export async function getFileExplorerData({
  session,
  fetch,
  url,
  path,
  search,
  mimes,
}: GetFileExplorerDataParams) {
  const filters = paramsToStrapiFilter(url.searchParams);

  const sort: Record<string, 1 | -1> = { name: 1 };

  const folders = queryWithStore<z.infer<typeof folderSchema>[]>({
    fetch,
    query: {
      location: '/strapi/upload/folders',
      opName: `strapiContentFolders`,
      docsPath: 'data',
      paginationPath: '',
    },
    variables: {
      page: 1,
      pageSize: 100,
      sort: Object.fromEntries(
        Object.entries(sort).map(([key, value]) => [key, value === -1 ? 'desc' : 'asc'])
      ),
      folderPath: path.folderPath || undefined,
      filters: {
        $and: { 0: { parent: { id: path.folder || { $null: true } } } },
      },
    },
    validator: folderSchema.array(),
    Authorization: `Bearer ${session.adminToken}`,
  }).then((store) => {
    return derived(store, ($store) => {
      return {
        ...$store,
        data:
          !$store.data?.docs || search
            ? []
            : $store.data.docs.map((folder) => ({ ...folder, id: -1 * folder.id })),
      };
    });
  });

  const files = queryWithStore<z.infer<typeof fileSchema>[]>({
    fetch,
    query: {
      location: '/strapi/upload/files',
      opName: `strapiContentFiles`,
      docsPath: 'results',
      paginationPath: 'pagination',
    },
    variables: {
      page: 1,
      pageSize: 100,
      sort: Object.fromEntries(
        Object.entries(sort).map(([key, value]) => [key, value === -1 ? 'desc' : 'asc'])
      ),
      filters: {
        $and: { 0: { folderPath: { [search ? '$startsWith' : '$eq']: path.folderPath || '/' } } },
        mime: { $in: mimes },
      },
      _q: search || undefined,
    },
    validator: fileSchema.array(),
    Authorization: `Bearer ${session.adminToken}`,
  });

  const combined = derived([await folders, await files], ([$folders, $files]) => {
    return {
      folders: $folders,
      files: {
        ...$files,
        data: {
          ...$files.data,
          docs:
            $files.data?.docs?.map((file) => {
              if (file.url.startsWith('/')) {
                const url = new URL(file.url, PUBLIC_API_URL);
                return {
                  ...file,
                  url: 'http://localhost:370/admin/strapi' + url.pathname + url.search,
                };
              }
              return {
                ...file,
                url: 'https://troop370atlanta.org/filestore' + url.pathname + url.search,
              };
            }) || [],
        },
      },
      loading: $folders.loading || $files.loading,
    };
  });

  return combined;
}

const folderSchema = z.object({
  children: z.object({ count: z.number() }).optional(),
  createdAt: z.string().datetime(),
  files: z.object({ count: z.number() }).optional(),
  id: z.number(),
  name: z.string(),
  path: z.string(),
  pathId: z.number(),
  updatedAt: z.string().datetime(),
});

const fileSchema = z.object({
  alternativeText: z.string().nullable(),
  caption: z.string().nullable(),
  createdAt: z.string().datetime(),
  ext: z.string(),
  folder: folderSchema.nullable(),
  folderPath: z.string(),
  formats: z.any(),
  hash: z.string(),
  height: z.number().nullable(),
  id: z.number(),
  isUrlSigned: z.boolean(),
  mime: z.string(),
  name: z.string(),
  previewUrl: z.string().nullable(),
  provider: z.string(),
  provider_metadata: z.any(),
  size: z.number(),
  updatedAt: z.string().datetime(),
  url: z.string(),
  width: z.number().nullable(),
});
