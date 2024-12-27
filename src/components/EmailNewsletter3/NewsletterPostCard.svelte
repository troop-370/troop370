<script lang="ts">
  import { PUBLIC_NEW_FILESTORE_PATH, PUBLIC_OLD_FILESTORE_PATH } from '$env/static/public';
  import { HardBreak } from '$pm/render/HardBreak';
  import { Newsletter3Link } from '$pm/render/Newsletter3Link';
  import { capitalize } from '$utils';
  import { Renderer } from '@cristata/prosemirror-to-html-js';
  import type { ProsemirrorDocNode } from '@cristata/prosemirror-to-html-js/dist/Renderer';
  import { marked } from 'marked';
  import { DOMParser } from 'xmldom';
  import { Number } from '.';

  export let name: string | undefined = undefined;
  export let description: string | undefined = undefined;
  export let body: ProsemirrorDocNode[];
  export let number: number;
  export let category: string;

  let html = `<code>JSON.stringify(body)</code>`;
  $: {
    try {
      const renderer = new Renderer();
      renderer.addNode(HardBreak);
      renderer.addMark(Newsletter3Link);
      html = renderer.render({
        type: 'doc',
        content: body,
      });
    } catch (err) {
      console.error(err);
    }

    html = html.replaceAll(PUBLIC_OLD_FILESTORE_PATH, PUBLIC_NEW_FILESTORE_PATH);
  }
</script>

{#if name}
  <h2>
    <Number {number} {category} />
    <span>{@html marked.parseInline(capitalize(name))}</span>
  </h2>
{/if}
{#if description}
  <p>{@html marked.parseInline(capitalize(description))}</p>
{/if}
<div class="post-content">{@html html}</div>

<style>
  h2 {
    font-family: roboto, sans-serif;
    font-size: 18px;
    line-height: 1.2;
    font-weight: 500;
    letter-spacing: normal;
    margin: 24px 0 2px 0;
    color: rgb(0, 0, 0) !important;
  }

  span {
    vertical-align: middle;
  }

  p,
  :global(.post-content p) {
    font-family: roboto, sans-serif;
    font-size: 14.5px;
    line-height: 1.35;
    font-weight: 400;
    letter-spacing: normal;
    margin: 2px 0 8px 0;
    opacity: 0.9;
    color: #000000;
  }

  p {
    font-size: 12.5px;
  }

  div {
    font-family: roboto, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    font-weight: 400;
    letter-spacing: 0.03125em;
    color: #000000;
  }

  .post-content :global(li p) {
    margin: 0;
  }

  .post-content :global(p + ul),
  .post-content :global(p + ol) {
    margin-top: calc(-8px + 4px);
    padding-inline-start: 22px;
  }
</style>
