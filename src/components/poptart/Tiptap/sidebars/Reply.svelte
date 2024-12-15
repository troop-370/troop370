<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import type { CommandProps, Editor } from '@tiptap/core';
  import { Button, IconButton, MenuFlyout, MenuFlyoutItem } from 'fluent-svelte';
  import { DateTime } from 'luxon';
  import type { ComponentProps } from 'svelte';
  import type { CommentStorage } from '../extension-power-comment/powerComment';
  import type Tiptap from '../Tiptap.svelte';
  import TextArea from '$components/poptart/TextArea/TextArea.svelte';

  export let comment: CommentStorage['comments'][0];
  export let disabled = false;
  export let selectCommentText: ({ commands }: CommandProps) => boolean;
  export let uuid: CommentStorage['comments'][0]['attrs']['replies'][0]['uuid'];
  export let startInEditMode: boolean;
  export let clearNewReplyUuid: () => void;
  export let hideReplyButton: boolean;

  let thisReply: CommentStorage['comments'][0]['attrs']['replies'][0] | undefined;
  $: thisReply = comment.attrs.replies.filter((reply) => reply.uuid === uuid)[0];

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
  let isEditMode = false;
  $: if (startInEditMode) setInEditMode();
  function setInEditMode() {
    isEditMode = true;
  }
  $: hideReplyButton = isEditMode;

  // exit edit mode if document is not editable
  $: if (isEditMode && !editor.isEditable) isEditMode = false;

  // store message field in state
  let message = '';

  /**
   * Save the comment message changes to the node attributes
   */
  function saveCommentReply() {
    if (disabled) return;
    if (!thisReply) return;
    const saved = editor
      .chain()
      .command((cp) => selectCommentText(cp))
      .unsetMark('powerComment')
      .setComment({
        ...comment.attrs,
        replies: [
          ...comment.attrs.replies.filter((reply) => reply.uuid !== uuid),
          { ...thisReply, message },
        ],
      })
      .focus()
      .scrollIntoView()
      .run();
    if (saved && startInEditMode) clearNewReplyUuid();
    if (saved && message === '') deleteCommentReply();
  }

  /**
   * Delete the comment reply
   */
  function deleteCommentReply() {
    editor
      .chain()
      .command((cp) => selectCommentText(cp))
      .unsetMark('powerComment')
      .setComment({
        ...comment.attrs,
        replies: comment.attrs.replies.filter((reply) => reply.uuid !== uuid),
      })
      .focus()
      .scrollIntoView()
      .run();
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if thisReply}
  <div class="reply-container">
    {#if !isEditMode}
      <div class="menu-container">
        <MenuFlyout bind:open={menuOpen} alignment="end" placement="bottom" {disabled}>
          <svelte:fragment slot="flyout">
            <MenuFlyoutItem
              on:click={() => {
                if (!thisReply) return;
                isEditMode = true;
                message = thisReply.message;
                menuOpen = false;
              }}
              disabled={disabled || !thisReply || !user || !editor.isEditable}
            >
              <FluentIcon name="Edit16Regular" slot="icon" />
              Edit reply
            </MenuFlyoutItem>
            <MenuFlyoutItem
              on:click={deleteCommentReply}
              disabled={disabled || !thisReply || !editor.isEditable}
            >
              <FluentIcon name="Delete16Regular" slot="icon" />
              Delete reply
            </MenuFlyoutItem>
          </svelte:fragment>
        </MenuFlyout>
      </div>
      <IconButton class="comment-card-menu-button" on:click={() => (menuOpen = !menuOpen)}>
        <FluentIcon name="MoreHorizontal16Regular" />
      </IconButton>
    {/if}

    <img src={thisReply.commenter?.photo} alt="" class="profile-photo" />
    <div class="commenter">{thisReply.commenter?.name}</div>

    {#if isEditMode}
      <TextArea bind:value={message} class="comment-message-box" />
      <div class="button-row">
        <Button
          on:click={() => {
            isEditMode = false;
            saveCommentReply();
          }}
          style="flex: 1;"
        >
          <FluentIcon name="Checkmark16Regular" mode="buttonIconLeft" />
          Save
        </Button>
        <Button
          on:click={() => {
            if (message === '' && thisReply?.message === '') deleteCommentReply();
            isEditMode = false;
          }}
          style="flex: 1;"
        >
          <FluentIcon name="Dismiss16Regular" mode="buttonIconLeft" />
          Cancel
        </Button>
      </div>
    {:else}
      <div class="message">{thisReply.message}</div>
      <div class="timestamp">
        {DateTime.fromISO(thisReply.timestamp).toFormat(`LLL. dd, yyyy, t`)}
      </div>
    {/if}
  </div>
{/if}

<style>
  .reply-container {
    position: relative;
    padding: 12px 16px 0;
    margin: 6px -16px 2px 4px;
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
