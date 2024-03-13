<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { Button } from 'fluent-svelte';
</script>

<div class="file-explorer-toolbar">
  <Button disabled>
    <FluentIcon name="FolderAdd16Regular" mode="buttonIconLeft" />
    New folder
  </Button>
  <Button disabled>
    <FluentIcon name="ArrowUpload16Regular" mode="buttonIconLeft" />
    Upload asset
  </Button>
</div>

<style>
  .file-explorer-toolbar {
    display: flex;
    justify-content: flex-start;
    padding: 0 0 10px 0;
    gap: 10px;
  }
</style>
