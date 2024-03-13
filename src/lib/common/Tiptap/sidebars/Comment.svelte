<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { TextArea } from '$lib/common/TextArea';
  import type Tiptap from '$lib/common/Tiptap/Tiptap.svelte';
  import type { CommandProps, Editor } from '@tiptap/core';
  import { Button, IconButton, MenuFlyout, MenuFlyoutItem } from 'fluent-svelte';
  import { DateTime } from 'luxon';
  import scrollIntoView from 'scroll-into-view-if-needed';
  import type { ComponentProps } from 'svelte';
  import { v4 as uuidv4 } from 'uuid';
  import type { CommentStorage } from '../extension-power-comment/powerComment';
  import Reply from './Reply.svelte';

  export let comment: CommentStorage['comments'][0];
  export let disabled = false;
  export let featureDisabled = false;
  export let key: string;

  let menuOpen = false;
  let cardElem: HTMLDivElement | null = null;

  export let editor: Editor;
  $: tr = editor.state.tr;
  $: dispatch = editor.view.dispatch;
  $: state = editor.state;

  export let user: ComponentProps<Tiptap>['user'] | null = null;
  $: coreNewCommentAttrs = {
    color: user?.color || '',
    commenter: { name: user?.name || '', photo: user?.photo || '' },
    sessionId: user?.sessionId || '',
  };

  // control whether in edit mode
  $: thisUserJustCreatedThisComment =
    comment.attrs.sessionId === user?.sessionId && comment.attrs.message === '';
  $: isEditMode = thisUserJustCreatedThisComment || false;

  // exit edit mode if document is not editable
  $: if (isEditMode && !editor.isEditable) isEditMode = false;

  // track when the comment is focused
  $: hasCursor = (() => {
    let start: number | undefined = undefined;
    let end: number | undefined = undefined;
    comment.nodes.forEach((node) => {
      if (!start) start = node.pos;
      else if (node.pos < start) start = node.pos;
      if (!end) end = node.pos + node.nodeSize;
      else if (node.pos + node.nodeSize > end) end = node.pos + node.nodeSize;
    });

    return (
      state.selection.from >= (start || 0) &&
      state.selection.from <= (end || 0) &&
      state.selection.to >= (start || 0) &&
      state.selection.to <= (end || 0)
    );
  })();

  // when the comment is focused, scroll into view
  $: if (cardElem && hasCursor) {
    scrollIntoView(cardElem, { block: 'nearest', scrollMode: 'if-needed' });
  }

  // store message field in state
  let message = '';

  /**
   * Save the comment message changes to the node attributes
   */
  function saveCommentMessage() {
    if (disabled) return;
    const saved = editor
      ?.chain()
      .command((cp) => selectCommentText(cp))
      .unsetMark('powerComment')
      .setComment({ ...comment.attrs, message })
      .focus()
      .scrollIntoView()
      .run();
    if (saved && message === '' && comment.attrs.replies.length === 0) deleteThread();
  }

  /**
   * Move's the client's cursor to the comment in the editor.
   */
  function focusComment() {
    editor
      .chain()
      .command((cp) => selectCommentText(cp))
      .focus()
      .scrollIntoView()
      .run();
  }

  /**
   * Selects the entire comment in the prosemirror editor.
   * @returns true if successful; false if error
   */
  function selectCommentText({ commands }: CommandProps): boolean {
    try {
      // select the entire comment
      let start: number | undefined = undefined;
      let end: number | undefined = undefined;
      comment.nodes.forEach((node) => {
        if (!start) start = node.pos;
        else if (node.pos < start) start = node.pos;
        if (!end) end = node.pos + node.nodeSize;
        else if (node.pos + node.nodeSize > end) end = node.pos + node.nodeSize;
      });
      return commands.setTextSelection({ from: start || 0, to: end || 0 });
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  /**
   * Adds an empty reply
   */
  let newReplyUuid = '';
  function addNewReply() {
    if (user) {
      const uuid = uuidv4();
      const wasAdded = editor
        .chain()
        .command((cp) => selectCommentText(cp))
        .unsetMark('powerComment')
        .setComment({
          ...comment.attrs,
          replies: [
            ...comment.attrs.replies,
            {
              commenter: {
                name: user.name,
                photo: user.photo,
              },
              message: '',
              timestamp: new Date().toISOString(),
              uuid: uuid,
            },
          ],
        })
        .focus()
        .scrollIntoView()
        .run();
      if (wasAdded) newReplyUuid = uuid;
    }
  }

  function clearNewReplyUuid() {
    newReplyUuid = '';
  }

  function deleteThread() {
    if (disabled) return;
    editor
      ?.chain()
      .command(({ commands, tr }) => {
        const deleted = [];
        for (let i = 0; i < comment.nodes.length; i++) {
          if (comment.nodes[i].nodeSize === 1) {
            deleted.push(
              commands.unsetComment(undefined, { from: comment.nodes[i].pos, to: comment.nodes[i].pos + 1 })
            );
          } else {
            deleted.push(commands.unsetComment(comment.nodes[i].pos + 1));
          }
        }
        return deleted.every((elem) => elem === true);
      })
      .setTextSelection(state.selection.anchor)
      .focus()
      .scrollIntoView()
      .run();
    menuOpen = false;
  }

  let hideReplyButton = false;
  function setHideReplyButton(value: boolean) {
    hideReplyButton = value;
  }

  function handleFocusOrClick(evt: FocusEvent | MouseEvent) {
    if (!hasCursor) {
      focusComment();
      setTimeout(() => {
        if (evt.target) {
          (evt.target as HTMLElement).focus();
        }
      }, 10);
    }
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="comment-card"
  class:hasCursor
  bind:this={cardElem}
  on:focusin={handleFocusOrClick}
  on:click={handleFocusOrClick}
>
  {#if !isEditMode}
    <div class="menu-container">
      <MenuFlyout bind:open={menuOpen} alignment="end" placement="bottom" {disabled}>
        <svelte:fragment slot="flyout">
          <MenuFlyoutItem
            on:click={() => {
              isEditMode = true;
              message = comment.attrs.message;
              menuOpen = false;
            }}
            disabled={disabled || featureDisabled || !user || !editor.isEditable}
          >
            <FluentIcon name="Edit16Regular" slot="icon" />
            Edit comment
          </MenuFlyoutItem>
          <MenuFlyoutItem on:click={deleteThread} disabled={disabled || !editor.isEditable}>
            <FluentIcon name="Delete16Regular" slot="icon" />
            Delete thread
          </MenuFlyoutItem>
        </svelte:fragment>
      </MenuFlyout>
    </div>
    <IconButton class="comment-card-menu-button" on:click={() => (menuOpen = !menuOpen)}>
      <FluentIcon name="MoreHorizontal16Regular" />
    </IconButton>
  {/if}

  <img src={comment.attrs.commenter.photo} alt="" class="profile-photo" />
  <div class="profile-photo--border" class:hasCursor />
  <div class="commenter">{comment.attrs.commenter.name}</div>

  {#if isEditMode}
    <TextArea bind:value={message} class="comment-message-box" />
    <div class="button-row">
      <Button
        disabled={featureDisabled}
        on:click={() => {
          if (featureDisabled) return;
          isEditMode = false;
          saveCommentMessage();
          message = '';
        }}
        style="flex: 1;"
      >
        <FluentIcon name="Checkmark16Regular" mode="buttonIconLeft" />
        Save
      </Button>
      <Button
        on:click={() => {
          if (comment.attrs.message === '' && comment.attrs.replies.every((reply) => reply.message === ''))
            deleteThread();
          isEditMode = false;
          message = '';
        }}
        style="flex: 1;"
      >
        <FluentIcon name="Dismiss16Regular" mode="buttonIconLeft" />
        Cancel
      </Button>
    </div>
  {:else}
    <div class="message">{comment.attrs.message}</div>
    <div class="timestamp">{DateTime.fromISO(comment.attrs.timestamp).toFormat(`LLL. dd, yyyy, t`)}</div>
  {/if}

  {#each comment.attrs.replies
    // filter out empty replies (this means that the person who created the reply is still editing it before sending it)
    .filter((reply) => {
      if (reply.uuid === newReplyUuid) return true;
      return reply.message !== '';
    })
    // sort with newest on bottom
    // (replies are not guarenteed to be in order)
    .sort((a, b) => {
      if (new Date(a.timestamp) > new Date(b.timestamp)) return 1;
      return -1;
    }) as reply}
    <Reply
      {editor}
      {selectCommentText}
      {comment}
      {user}
      uuid={reply.uuid}
      startInEditMode={reply.uuid === newReplyUuid}
      {clearNewReplyUuid}
      bind:hideReplyButton
    />
  {/each}

  {#if !isEditMode && !hideReplyButton}
    <div class="button-row" style="margin-top: 10px;">
      <Button
        on:click={disabled || featureDisabled || hideReplyButton ? undefined : () => addNewReply()}
        disabled={disabled || featureDisabled || hideReplyButton}
      >
        <FluentIcon name="ArrowReplyDown16Regular" mode="buttonIconLeft" />
        Reply
      </Button>
    </div>
  {/if}
</div>

<style>
  .comment-card {
    --background-color: var(--fds-control-fill-default);
    --border-color: var(--color-neutral-light-200);
    position: relative;
    background-color: var(--background-color);
    box-sizing: border-box;
    padding: 12px 16px;
    margin: 0 20px 10px 20px;
    width: 250px;
    border: 1px solid var(--border-color);
    border-radius: var(--fds-control-corner-radius);
    transition: margin 120ms;
  }
  .comment-card.hasCursor {
    margin: 0 30px 10px 10px;
    border-color: var(--fds-accent-default);
  }
  .comment-card *::selection {
    background-color: transparent !important;
  }

  @media (prefers-color-scheme: dark) {
    .comment-card {
      --background-color: var(--fds-control-fill-default);
      --border-color: var(--color-neutral-dark-200);
    }
  }

  .profile-photo {
    width: 20px;
    height: 20px;
    border-radius: calc(var(--fds-control-corner-radius) - 0.6px) var(--fds-control-corner-radius)
      var(--fds-control-corner-radius) calc(var(--fds-control-corner-radius) - 0.6px);
    box-shadow: var(--background-color) 0 0 0 0.6px;
    position: absolute;
    top: 0;
    left: 0;
    transform: translateX(-12px) translateY(10px);
    z-index: 1;
  }

  .profile-photo--border {
    position: absolute;
    border-radius: calc(var(--fds-control-corner-radius) - 0.6px) 0 0
      calc(var(--fds-control-corner-radius) - 0.6px);
    box-shadow: none;
    width: 10.5px;
    height: 20px;
    top: 0;
    left: 0;
    transform: translateX(-12px) translateY(10px);
  }
  .profile-photo--border.hasCursor {
    box-shadow: var(--fds-accent-default) 0px 0px 0px 1.5px;
  }

  .commenter {
    display: flex;
    font-size: 16px;
    line-height: 16px;
    font-family: var(--fds-font-family-text);
    font-weight: 600;
    color: var(--fds-text-primary);
  }

  .message {
    display: flex;
    font-size: 14px;
    line-height: 16px;
    font-family: var(--fds-font-family-text);
    color: var(--fds-text-primary);
    margin: 8px 0 6px 0;
    white-space: break-spaces;
    word-break: break-word;
    user-select: text;
  }

  .timestamp {
    display: flex;
    font-size: 11px;
    line-height: 11px;
    font-family: var(--fds-font-family-text);
    color: var(--fds-text-primary);
  }

  :global(.comment-card-menu-button) {
    position: absolute;
    top: 7px;
    right: 7px;
    border-color: transparent;
    background-color: transparent;
    width: 28px;
    height: 28px;
    min-block-size: 28px !important;
    min-inline-size: 28px !important;
    padding: 0 !important;
  }
  :global(.comment-card-menu-button svg) {
    width: 18px !important;
    height: 18px !important;
    inline-size: 18px !important;
  }

  .menu-container {
    position: absolute;
    top: 7px;
    right: 7px;
    margin-top: 10px;
  }

  :global(.comment-message-box) {
    margin: 10px 0;
  }

  .button-row {
    display: flex;
    flex-direction: row;
    gap: 6px;
    align-items: center;
    justify-content: flex-end;
  }
</style>
