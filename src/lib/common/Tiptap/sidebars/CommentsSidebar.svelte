<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import type Tiptap from '$lib/common/Tiptap/Tiptap.svelte';
  import { SidebarHeader } from '$lib/sidebar';
  import type { Editor } from '@tiptap/core';
  import { Button } from 'fluent-svelte';
  import type { ComponentProps } from 'svelte';
  import type { tiptapOptions } from '../../../../config';
  import type { CommentStorage } from '../extension-power-comment/powerComment';
  import { richTextParams } from '../richTextParams';
  import Comment from './Comment.svelte';

  export let editor: Editor | null = null;
  export let disabled = false;
  export let options: tiptapOptions | undefined = undefined;
  export let user: ComponentProps<Tiptap>['user'] | null = null;
  $: coreNewCommentAttrs = {
    color: user?.color || '',
    commenter: { name: user?.name || '', photo: user?.photo || '' },
    sessionId: user?.sessionId || '',
  };

  let headerHeight = 100;

  $: storage = editor?.storage.powerComment as CommentStorage | undefined;
  $: comments = storage?.comments;

  $: commentsDisabled = disabled || !options?.features.comment || !user;
  $: cannotCreateComment = !editor?.can().setComment(coreNewCommentAttrs);
</script>

<div class="header" bind:clientHeight={headerHeight}>
  <SidebarHeader on:click={() => $richTextParams.set('comments', 0)}>Comments</SidebarHeader>

  <div class="button-row">
    <Button
      on:click={commentsDisabled
        ? undefined
        : () => editor?.chain().focus().setComment(coreNewCommentAttrs).run()}
      disabled={commentsDisabled || cannotCreateComment}
    >
      <FluentIcon mode="buttonIconLeft">
        <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
          <path
            type="path"
            class="OfficeIconColors_HighContrast"
            d="M 0 410 h 410 v -410 h 128 v 410 h 409 v 128 h -409 v 409 h -128 v -409 h -410 m 1946 -333 v 1229 h -1022 l -514 512 v -512 h -308 v -743 h 103 v 640 h 307 v 367 l 367 -367 h 964 v -1024 h -742 v -102 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m20"
            d="M 1894 256 v 1126 h -991 l -442 440 v -440 h -307 v -691 h 153 v 410 h 384 v -410 h 410 v -435 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m22"
            d="M 1946 205 v 1229 h -1022 l -514 512 v -512 h -308 v -743 h 103 v 640 h 307 v 367 l 367 -367 h 964 v -1024 h -742 v -102 z"
          />
          <path
            type="path"
            class="OfficeIconColors_m27"
            d="M 0 410 h 410 v -410 h 128 v 410 h 409 v 128 h -409 v 409 h -128 v -409 h -410 z"
          />
        </svg>
      </FluentIcon>
      New
    </Button>
  </div>
</div>

<div class="comments-wrapper" style="height: calc(100% - {headerHeight}px);">
  {#if editor}
    {#each comments || [] as comment}
      <div class="comment-card">
        <Comment
          {editor}
          {comment}
          {disabled}
          featureDisabled={commentsDisabled}
          {user}
          key={comment.attrs.uuid + comment.attrs.message}
        />
      </div>
    {/each}
  {/if}
</div>

<style>
  .button-row {
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
    justify-content: flex-end;
    padding: 0 16px 16px 16px;
  }

  .comments-wrapper {
    padding: 0 12px 0 12px;
    overflow: auto;
    scroll-behavior: smooth;
  }
</style>
