<script lang="ts">
  import { page } from '$app/stores';
  import type { NodeViewProps } from '@tiptap/core';
  import { ProgressRing } from 'fluent-svelte';
  import { NodeViewWrapper, draggable, editable } from 'svelte-tiptap';
  import WidgetWrapper from '../WidgetWrapper.svelte';

  export let node: NodeViewProps['node'];
  export let editor: NodeViewProps['editor'];
  export let getPos: NodeViewProps['getPos'];
  export let updateAttributes: NodeViewProps['updateAttributes'];

  $: {
    getPhotoDetails(node.attrs.photoId);
  }

  let loading = false;
  function getPhotoDetails(photoId: string) {
    // loading = true;
    // const isId = isObjectId(photoId);
    // query<PhotoBasicByRegexnameOrUrlQuery, PhotoBasicByRegexnameOrUrlQueryVariables>({
    //   fetch,
    //   tenant: $page.params.tenant,
    //   query: PhotoBasicByRegexnameOrUrl,
    //   useCache: false,
    //   variables: {
    //     limit: 1,
    //     page: 1,
    //     filter: JSON.stringify({
    //       // ensure that the photo creater string exists and is not null or undefined or empty string
    //       $and: [
    //         { 'people.photo_created_by': { $exists: true } },
    //         { 'people.photo_created_by': { $ne: null } },
    //         { 'people.photo_created_by': { $ne: '' } },
    //       ],
    //       // match by string included in name OR exact same URL (only if not an object Id [use _id arg instead])
    //       ...(isId
    //         ? { _id: photoId }
    //         : { $or: [{ name: { $regex: photoId, $options: 'i' } }, { photo_url: photoId }] }),
    //     }),
    //   },
    // })
    //   .finally(() => {
    //     loading = false;
    //   })
    //   .then((result) => {
    //     const photo = result?.data?.photos?.docs?.[0];

    //     // set the photo url and credit attributes
    //     if (photo && editor.isEditable) {
    //       if (photo.photo_url && photo.photo_url !== node.attrs.photoUrl) {
    //         updateAttributes({ photoUrl: photo.photo_url });
    //       }
    //       if (photo.people?.photo_created_by && photo.people.photo_created_by !== node.attrs.photoCredit) {
    //         updateAttributes({ photoCredit: photo.people.photo_created_by });
    //       }
    //     }
    //   });
    return photoId;
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
  <WidgetWrapper position={node.attrs.position} on:click={selectNodeTextEnd}>
    <div
      class="img-wrapper"
      class:left={node.attrs.position === 'left'}
      class:right={node.attrs.position === 'right'}
    >
      <img src={node.attrs.photoUrl + '?tr=w-600'} alt="" use:draggable class:loading />
      <div class="progress" class:loading>
        <ProgressRing style="--fds-accent-default: black;" />
      </div>
    </div>
    <div class="caption" class:show={node.attrs.showCaption === true}>
      {#if node.attrs.showCaption === true}
        <span use:editable class="editable" class:showPlaceholder={node.textContent.length === 0} />
      {/if}
      <span class="source">{node.attrs.photoCredit}</span>
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
  .editable :global(*) {
    display: inline-block;
  }
  .editable.showPlaceholder::before {
    content: 'Type a caption… (or hide it via the ribbon)';
    position: absolute;
    color: var(--theme-color-neutral-light-600);
    pointer-events: none;
    height: 0;
    transform: translateX(-50%);
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
