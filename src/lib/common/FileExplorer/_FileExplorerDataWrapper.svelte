<script lang="ts">
  import { browser } from '$app/environment';
  import { debounce, hasKey } from '$utils';
  import { setContext } from 'svelte';
  import { get, writable } from 'svelte/store';
  import FileExplorer from './_FileExplorer.svelte';
  import { getFileExplorerData } from './getFileExplorerData';

  export let session: Partial<SessionData>;
  export let url: URL;
  export let selectedIds = writable<number[]>([]);
  export let selectedFilesData = writable<File[]>([]);
  export let selectedFoldersData = writable<Folder[]>([]);
  export let selectedIdsData = writable<(File | Folder)[]>([]);
  export let mimeTypes: string[] = [];
  export let enableMultiRowSelection = true;

  type Store = Awaited<ReturnType<typeof getFileExplorerData>>;
  type StoreValue = Parameters<Parameters<Store['subscribe']>[0]>[0];
  type FoldersStoreValue = StoreValue['folders'];
  type FoldersStoreData = FoldersStoreValue['data'];
  type Folder = NonNullable<FoldersStoreData[number]>;
  type FilesStoreValue = StoreValue['files'];
  type FilesStoreData = FilesStoreValue['data'];
  type File = NonNullable<FilesStoreData>['docs'][number];

  const path = writable({
    folder: 0,
    folderPath: '',
    breadcrumbs: '',
    folderNumberPath: '0',
  });

  const search = writable('');

  $: promise = browser
    ? getFileExplorerData({ url, fetch, session, path: $path, search: $search, mimes: mimeTypes })
    : undefined;

  const debouncedGetSelectedIdsData = debounce(getSelectedIdsData, 300);
  function getSelectedIdsData() {
    promise?.then((data: Store) => {
      const files =
        get(data)
          .files.data?.docs.filter((file) => $selectedIds.includes(file.id))
          .filter((file): file is File => hasKey(file, 'hash')) || [];
      const folders =
        get(data)
          .folders.data?.filter((folder: Folder): folder is Folder => !hasKey(folder, 'hash'))
          .filter((folder) => $selectedIds.includes(folder.id)) || [];
      selectedFilesData.set(files);
      selectedFoldersData.set(folders);
      selectedIdsData.set([...folders, ...files]);
    });
  }
  $: {
    $selectedIds;
    debouncedGetSelectedIdsData();
  }

  setContext('fileExplorer', {
    selectedFilesData: selectedFilesData,
    selectedFoldersData: selectedFoldersData,
    selectedIdsData: selectedIdsData,
  });
</script>

{#await promise}
  <FileExplorer {path} {search} {selectedIds} {enableMultiRowSelection} {mimeTypes} />
{:then store}
  <FileExplorer {store} {path} {search} {selectedIds} {enableMultiRowSelection} {mimeTypes} />
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}
