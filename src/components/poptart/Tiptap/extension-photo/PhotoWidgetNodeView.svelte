<script lang="ts">
  import { page } from '$app/stores';
  import { convertFileURL } from '$components/poptart/FileExplorer/getFileExplorerData';
  import { isNumber, type NodeViewProps } from '@tiptap/core';
  import { ProgressRing } from 'fluent-svelte';
  import { NodeViewContent, NodeViewWrapper } from 'svelte-tiptap';
  import WidgetWrapper from '../WidgetWrapper.svelte';

  export let node: NodeViewProps['node'];
  export let editor: NodeViewProps['editor'];
  export let getPos: NodeViewProps['getPos'];
  export let updateAttributes: NodeViewProps['updateAttributes'];

  $: {
    getPhotoDetails(node.attrs.photoId);
  }

  let loading = false;
  function getPhotoDetails(photoId: number) {
    loading = true;
    const isId = isNumber(photoId);
    fetch(`/strapi/upload/files/${photoId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${$page.data.session.adminToken}`,
      },
    })
      .then((response) => response.json())
      .finally(() => {
        loading = false;
      })
      .then((photo) => {
        // set the photo url and credit attributes
        if (photo && editor.isEditable) {
          if (photo.url) {
            const photoUrl = convertFileURL(photo.url, $page.url.origin);
            if (photoUrl !== node.attrs.photoUrl) {
              updateAttributes({ photoUrl });
            }
          } else {
            updateAttributes({ photoUrl: '' });
          }

          if (photo.caption && photo.caption !== node.attrs.photoCredit) {
            updateAttributes({ photoCredit: photo.caption });
          } else {
            updateAttributes({ photoCredit: '' });
          }
        }
      });
  }

  function selectNodeTextEnd() {
    if (typeof getPos === 'function') {
      if (node.attrs.showCaption === true) {
        const resolvedPos = editor.state.doc.resolve(getPos() + 1);

        if (resolvedPos.nodeAfter) {
          editor.commands.setTextSelection(getPos() + 1 + resolvedPos.nodeAfter.nodeSize);
        }
      } else {
        editor.commands.setNodeSelection(getPos());
      }
    }
  }
</script>

<NodeViewWrapper>
  <WidgetWrapper position={node.attrs.position}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      contenteditable="false"
      class="img-wrapper"
      class:left={node.attrs.position === 'left'}
      class:right={node.attrs.position === 'right'}
      on:click={selectNodeTextEnd}
    >
      <img src={node.attrs.photoUrl + '?tr=w-600'} alt="" data-drag-handle class:loading />
      <div class="progress" class:loading>
        <ProgressRing style="--fds-accent-default: black;" />
      </div>
    </div>
    <div class="caption" class:show={node.attrs.showCaption === true}>
      <div
        class="editable"
        class:showPlaceholder={node.textContent.length === 0}
        class:hideCaption={node.attrs.showCaption !== true}
      >
        <NodeViewContent contenteditable />
      </div>
      <span class="source" contenteditable="false">{node.attrs.photoCredit}</span>
    </div>
  </WidgetWrapper>
</NodeViewWrapper>

<style>
  img {
    width: 100%;
  }
  img.loading {
    opacity: 0.1;
  }

  .img-wrapper {
    position: relative;
    margin: 20px 0;
    user-select: none;
    cursor: default;
    display: flex;
  }
  .img-wrapper.left,
  .img-wrapper.right {
    margin: 0 0 20px 0;
  }

  .progress {
    position: absolute;
    top: calc(50% - 16px);
    left: calc(50% - 16px);
  }
  .progress:not(.loading) {
    display: none;
  }

  .editable {
    display: inline-block;
    color: #666;
    font-size: 90%;
    text-align: center;
  }
  .editable.showPlaceholder {
    width: 100%;
  }
  .editable.showPlaceholder::before {
    content: 'Type a caption… (or hide it via the ribbon)';
    position: absolute;
    color: var(--theme-color-neutral-light-600);
    pointer-events: none;
    height: 0;
    transform: translateX(-50%);
  }
  .editable.hideCaption {
    display: none;
  }

  .caption {
    display: block;
    text-align: right;
    margin: -20px 0 10px 0;
    line-height: 1.3;
  }
  .caption.show {
    text-align: center;
    margin: -10px 0 10px 0;
  }

  .source {
    display: inline;
    margin-top: 4px;
    font-family: Georgia, Times, 'Times New Roman', serif;
    color: #a7a7a7;
    font-size: 13px;
    cursor: default;
    margin-left: 6px;
    user-select: none;
  }
</style>
