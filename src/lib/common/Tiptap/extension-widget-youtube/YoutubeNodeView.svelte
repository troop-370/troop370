<script lang="ts">
  import type { NodeViewProps } from '@tiptap/core';
  import { onMount } from 'svelte';
  import { NodeViewWrapper, editable } from 'svelte-tiptap';
  import YoutubePlayer from 'youtube-player';
  import type { YouTubePlayer } from 'youtube-player/dist/types';

  export let node: NodeViewProps['node'];
  export let editor: NodeViewProps['editor'];
  export let getPos: NodeViewProps['getPos'];
  export let updateAttributes: NodeViewProps['updateAttributes'];

  let playerElem: HTMLIFrameElement;
  let player: YouTubePlayer;

  $: if (node.attrs.playerPaused === false) {
    player?.playVideo();
  } else {
    player?.pauseVideo();
  }

  // create the player initially
  onMount(() => createPlayer());

  // handle if video id changes
  $: {
    if (node.attrs.playerPaused || node.attrs.playerPaused === undefined) queue(node.attrs.videoId);
    else play(node.attrs.videoId);
  }

  function createPlayer() {
    player = YoutubePlayer(playerElem, {
      height: '390',
      width: '640',
      playerVars: {
        playsinline: 0,
        controls: 0,
        autoplay: 0,
      },
    });

    // Register event handlers
    player.on('ready', onPlayerReady);
    // player.on('error', onPlayerError);
    player.on('stateChange', onPlayerStateChange);
    // player.on('playbackRateChange', onPlayerPlaybackRateChange);
    // player.on('playbackQualityChange', onPlayerPlaybackQualityChange);

    // Tear down player when done
    return () => player.destroy();
  }

  function queue(videoId: string) {
    // this is needed because the loadVideoById function always starts playing,
    // even if you have set autoplay to 1 whereas the cueVideoById function
    // never starts autoplaying
    if (player && videoId) {
      player.cueVideoById(videoId);
    }
  }

  function play(videoId: string) {
    // this is needed because the loadVideoById function always starts playing,
    // even if you have set autoplay to 1 whereas the cueVideoById function
    // never starts autoplaying
    if (player && videoId) {
      player.loadVideoById(videoId);
    }
  }

  function onPlayerReady(evt: CustomEvent) {
    player?.playVideo();
  }

  let playerStatus: number = -1;
  function onPlayerStateChange(evt: CustomEvent & { data: number }) {
    playerStatus = evt.data;

    // ended
    if (playerStatus == 0) {
      updateAttributes({ playerPaused: true });
    }

    // paused
    if (playerStatus === 2) {
      // if still paused after two seconds, hide the player
      setTimeout(() => {
        if (playerStatus === 2) updateAttributes({ playerPaused: true });
      }, 2000);
    }
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

  // TODO: use unique player ID so that multiple embeds can exist
</script>

<NodeViewWrapper>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="player-container" on:click={selectNodeTextEnd}>
    <iframe
      bind:this={playerElem}
      title="YouTube video"
      class:playerPaused={node.attrs.playerPaused || node.attrs.playerPaused === undefined}
      width="100%"
      id="player"
      src="https://www.youtube-nocookie.com/embed/{node.attrs.videoId}?modestbranding=1&enablejsapi=1"
      frameBorder="0"
      allow="encrypted-media"
      allowFullScreen
    />

    <div
      class="thumbnail"
      style="background-image: url('http://i3.ytimg.com/vi/{node.attrs.videoId}/maxresdefault.jpg');"
      class:playerPaused={node.attrs.playerPaused || node.attrs.playerPaused === undefined}
    >
      <svg
        width="80"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 159 110"
        on:click={() => updateAttributes({ playerPaused: !node.attrs.playerPaused })}
        on:keydown={() => updateAttributes({ playerPaused: !node.attrs.playerPaused })}
      >
        <path
          d="m154 17.5c-1.82-6.73-7.07-12-13.8-13.8-9.04-3.49-96.6-5.2-122 0.1-6.73 1.82-12 7.07-13.8 13.8-4.08 17.9-4.39 56.6 0.1 74.9 1.82 6.73 7.07 12 13.8 13.8 17.9 4.12 103 4.7 122 0 6.73-1.82 12-7.07 13.8-13.8 4.35-19.5 4.66-55.8-0.1-75z"
          fill="#f00"
        />
        <path d="m105 55-40.8-23.4v46.8z" fill="#fff" />
      </svg>
    </div>
  </div>

  {#if node.attrs.showCaption === true}
    <div use:editable class="editable" class:showPlaceholder={node.textContent.length === 0} />
  {/if}
</NodeViewWrapper>

<style>
  .player-container {
    user-select: none;
  }

  iframe {
    width: 100%;
    aspect-ratio: 16/9;
  }
  iframe.playerPaused {
    display: none;
  }

  .thumbnail {
    width: 100%;
    background-size: cover;
    aspect-ratio: 16/9;
    background-color: black;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
  }
  .thumbnail:not(.playerPaused) {
    display: none;
  }

  svg {
    cursor: pointer;
  }

  .editable {
    display: block;
    margin: 0px 0 10px 0;
    color: #666;
    font-size: 90%;
    text-align: center;
  }
  .editable.showPlaceholder::before {
    content: 'Type a caption… (or hide it via the ribbon)';
    position: absolute;
    color: var(--theme-color-neutral-light-600);
    pointer-events: none;
    height: 0;
    transform: translateX(-50%);
  }
</style>
