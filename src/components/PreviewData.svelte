<script lang="ts">
  import { browser } from '$app/environment';
  import { beforeNavigate } from '$app/navigation';
  import { hasKey } from '$utils';
  import { onMount } from 'svelte';

  export let origin: string;
  export let fields: Readonly<Record<string, any>> = Object.freeze({});

  // tell the parent component that we are ready for data
  if (browser) {
    parent.postMessage('connected', origin);
  }

  // send a copy of this page's content to the parent of the frame
  // whenever the fields variable changes
  $: {
    if (browser && fields) {
      const contentTag = document.querySelector('#cristata-preview-content')?.outerHTML;
      const styleString = Array.from(document.styleSheets)
        .map((elem) => {
          try {
            return Array.from(elem.cssRules);
          } catch (error) {
            return null;
          }
        })
        .filter((cssRules): cssRules is CSSRule[] => !!cssRules)
        .map((cssRules) => {
          return cssRules.map((rule) => rule.cssText).join('\n');
        })
        .join('\n');
      parent.postMessage(JSON.stringify({ contentTag, styleString }), origin);
    }
  }

  // add a listener that recieves data
  onMount(() => {
    interface FieldsUpdate {
      type: 'field';
      fields: Record<string, any>;
    }

    function isFieldsUpdate(toCheck: any): toCheck is FieldsUpdate {
      return (
        toCheck &&
        typeof toCheck === 'object' &&
        !Array.isArray(toCheck) &&
        hasKey(toCheck, 'type') &&
        toCheck.type === 'fields' &&
        hasKey(toCheck, 'fields')
      );
    }

    function handleMessage(message: string | Record<string, any>) {
      message = message.replace('[iFrameSizer]message:', '');

      try {
        if (typeof message === 'string') {
          const parsed = JSON.parse(message);
          message = parsed;
        }
      } catch (error) {}

      if (isFieldsUpdate(message)) {
        fields = Object.freeze(message.fields);
      }
    }

    const reportMessages = (e: MessageEvent) => {
      handleMessage(e.data);
    };
    window.addEventListener('message', reportMessages, false);
    return () => {
      window.removeEventListener('message', reportMessages);
    };
  });

  // add iframe resizer script
  onMount(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src =
      'https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.2.11/iframeResizer.contentWindow.min.js';
    document.body.appendChild(script);
  });

  // prevent navigation so iframe does not excape to a different url
  beforeNavigate(({ cancel, to }) => {
    if (to) cancel();
  });
</script>
