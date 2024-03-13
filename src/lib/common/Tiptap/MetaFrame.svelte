<script lang="ts">
  import { isJSON } from '$utils';
  import { iframeResizer } from 'iframe-resizer';
  import { afterUpdate, beforeUpdate, onDestroy, onMount } from 'svelte';
  import type { Readable } from 'svelte/store';

  export let src: string;
  export let tiptapwidth: number;
  export let iframehtmlstring = '';
  export let fullSharedData: Readable<Record<string, unknown>>;
  let iframeElem: HTMLIFrameElement | undefined;
  let frameObj: iframeResizer.IFrameComponent['iFrameResizer'] | undefined;

  onMount(() => {
    if (iframeElem) {
      frameObj = iframeResizer(
        {
          autoResize: true,
          checkOrigin: false,
          heightCalculationMethod: 'documentElementOffset',
          inPageLinks: false,
          resizeFrom: 'child',
        },
        iframeElem
      )[0]?.iFrameResizer;
    }
  });

  onDestroy(() => {
    frameObj?.close();
  });

  function reportMessages(evt: MessageEvent) {
    if (evt.origin !== new URL(src).origin) return;

    // on initial connection event, send data
    if (evt.data === 'connected') {
      sendFields();
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
  }

  function sendFields(fields?: typeof $fullSharedData) {
    iframeElem?.contentWindow?.postMessage(
      JSON.stringify({
        type: 'fields',
        fields: fields || $fullSharedData,
      }),
      new URL(src).origin
    );
  }

  $: sendFields($fullSharedData);

  afterUpdate(() => {
    window.addEventListener('message', reportMessages, false);
  });

  beforeUpdate(() => {
    window.removeEventListener('message', reportMessages, false);
  });
</script>

<iframe
  {src}
  bind:this={iframeElem}
  contenteditable="false"
  allowtransparency={true}
  title="richtiptap-header-or-meta"
  style="--margin-bottom: {tiptapwidth <= 760 ? -6 : -74}px;"
/>

<style>
  iframe {
    width: 100%;
    border: none;
    margin-bottom: var(--margin-bottom, -74px);
    color-scheme: light;
  }
</style>
