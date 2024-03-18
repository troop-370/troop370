<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { motionMode } from '$stores/motionMode';
  import { isJSON } from '$utils';
  import { ProgressRing, TextBlock } from 'fluent-svelte';
  import { iframeResizer } from 'iframe-resizer';
  import { afterUpdate, beforeUpdate, onDestroy, onMount } from 'svelte';
  import { expoOut } from 'svelte/easing';
  import { create_in_transition } from 'svelte/internal';
  import { fly } from 'svelte/transition';

  export let src = '';
  export let iframehtmlstring = '';
  export let fullSharedData: Record<string, unknown>;
  export let noOuterMargin = false;
  export let style = '';
  export let hide = false;
  let iframeElem: HTMLIFrameElement | undefined;
  let frameObj: iframeResizer.IFrameComponent['iFrameResizer'] | undefined;
  let connected = false;
  let connectionFailed = false;
  let dataSent = false;
  let resized = false;

  $: hidden = dataSent === false || resized === false || hide === true;

  // fly in when hidden changes to false
  $: if (hidden === false) flyFrame();
  function flyFrame() {
    if (iframeElem) {
      create_in_transition(iframeElem, fly, {
        y: 40,
        duration: $motionMode === 'reduced' ? 0 : 270,
        easing: expoOut,
      }).start();
    }
  }

  onMount(() => {
    if (iframeElem) {
      frameObj = iframeResizer(
        {
          autoResize: true,
          checkOrigin: false,
          heightCalculationMethod: 'documentElementOffset',
          inPageLinks: false,
          resizeFrom: 'child',
          resizedCallback() {
            resized = true;
          },
        },
        iframeElem
      )[0]?.iFrameResizer;
      handleLoad();
    }
  });

  onDestroy(() => {
    frameObj?.close();
    dataSent = false;
    resized = false;
  });

  $: reportMessages = (evt: MessageEvent) => {
    if (evt.origin !== new URL(src).origin) return;

    // on initial connection event, send data
    if (evt.data === 'connected') {
      connected = true;
      // connectionFailed = false
      if (iframeElem) sendFields(iframeElem);
    }

    // if the event data is JSON, check if
    // it is an object with the frame content and styles
    if (isJSON(evt.data)) {
      const parsed = JSON.parse(evt.data);
      if (
        parsed?.contentTag &&
        typeof parsed.contentTag === 'string' &&
        parsed.styleString &&
        typeof parsed.styleString === 'string'
      ) {
        const frameString = `
          <div id="iframeTop">
            <style${'>'}${parsed.styleString}</style>
            ${parsed.contentTag}
          </div>
        `;
        iframehtmlstring = frameString;
      }
    }
  };

  function sendFields(iframeElem: HTMLIFrameElement, fields?: typeof fullSharedData) {
    dataSent = true;
    iframeElem.contentWindow?.postMessage(
      JSON.stringify({
        type: 'fields',
        fields: fields || fullSharedData,
      }),
      new URL(src).origin
    );
  }

  $: if (iframeElem) sendFields(iframeElem, fullSharedData);

  afterUpdate(() => {
    window.addEventListener('message', reportMessages, false);
  });

  beforeUpdate(() => {
    window.removeEventListener('message', reportMessages, false);
  });

  function handleLoad() {
    dataSent = false;
    resized = false;
    connectionFailed = false;
    setTimeout(() => {
      if (!connected) connectionFailed = true;
    }, 30000);
  }
</script>

<div class="wrapper" class:noScroll={hidden} class:noOuterMargin {style} class:hide>
  {#if hidden}
    <div
      in:fly={{ y: 40, duration: $motionMode === 'reduced' ? 0 : 270, easing: expoOut }}
      style="height: 100%; width: 100%; min-height: 120px; display: flex; flex-direction: column; gap: 14px; align-items: center; justify-content: center; position: absolute; top: 0; margin-top: 20px;"
    >
      {#if !src}
        <FluentIcon
          name="DismissCircle24Regular"
          style="width: 32px; height: 32px; fill: var(--fds-accent-default);"
        />
        <TextBlock variant="bodyStrong">Previews are not enabled for this collection</TextBlock>
        <TextBlock variant="caption" style="margin-top: -10px;">
          Ask your administrator to enable previews
        </TextBlock>
      {:else if connectionFailed}
        <FluentIcon
          name="ErrorCircle24Regular"
          style="width: 32px; height: 32px; fill: var(--fds-accent-default);"
        />
        <TextBlock variant="bodyStrong">Preview connection failed</TextBlock>
      {:else}
        <ProgressRing size={32} />
        <TextBlock variant="bodyStrong">Preparing preview</TextBlock>
      {/if}
    </div>
  {/if}

  {#if src}
    <iframe
      {src}
      bind:this={iframeElem}
      contenteditable="false"
      allowtransparency={true}
      title="preview-frame"
      class:hidden
    />
  {/if}
</div>

<style>
  .wrapper {
    --margin: 8px;
    width: calc(100% - calc(var(--margin) * 2));
    height: calc(100% - calc(var(--margin) * 2));
    overflow: auto;
    margin: var(--margin);
    border-radius: var(--fds-control-corner-radius);
    color: var(--fds-text-primary);
    position: relative;
    min-height: 120px;
  }
  .wrapper.noScroll {
    overflow: hidden;
  }
  .wrapper.noOuterMargin {
    --margin: 0;
  }
  .wrapper.hide {
    display: none;
  }

  iframe {
    width: 100%;
    border: none;
    border-radius: var(--fds-control-corner-radius);
    /* margin-bottom: var(--margin-bottom, -74px); */
    color-scheme: light;
  }

  iframe.hidden {
    display: none;
  }
</style>
