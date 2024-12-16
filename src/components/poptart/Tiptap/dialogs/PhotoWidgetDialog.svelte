<script lang="ts">
  import { page } from '$app/stores';
  import { FileExplorerDialog } from '$components/poptart/FileExplorer';

  export let open = false;

  export let handleAction: (() => Promise<void>) | undefined = undefined;
  export let handleSumbit: ((id: number) => Promise<void>) | undefined = undefined;
  export let handleCancel: (() => Promise<void>) | undefined = undefined;
</script>

<FileExplorerDialog
  url={$page.url}
  session={$page.data.session}
  bind:open
  mimeTypes={[
    'image/apng',
    'image/avif',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'image/webp',
  ]}
  handleAction={async (selectedFiles) => {
    if (selectedFiles?.[0]?.id) {
      handleSumbit?.(selectedFiles[0].id);
      handleAction?.();
    } else {
      handleCancel?.();
      handleAction?.();
    }
    open = false;
  }}
/>
