<script lang="ts">
  import { PUBLIC_NEW_FILESTORE_PATH, PUBLIC_OLD_FILESTORE_PATH } from '$env/static/public';
  import { HardBreak } from '$pm/render/HardBreak';
  import { Newsletter2Link } from '$pm/render/Newsletter2Link';
  import { Renderer } from '@cristata/prosemirror-to-html-js';
  import type { ProsemirrorDocNode } from '@cristata/prosemirror-to-html-js/dist/Renderer';
  import { marked } from 'marked';
  import { CardTable } from '.';

  export let name: string | undefined = undefined;
  export let description: string | undefined = undefined;
  export let body: ProsemirrorDocNode[];

  let html = `<code>JSON.stringify(body)</code>`;
  $: {
    try {
      const renderer = new Renderer();
      renderer.addNode(HardBreak);
      renderer.addMark(Newsletter2Link);
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

<CardTable>
  <tr>
    <td>
      {#if name}
        <h2>{@html marked.parseInline(name)}</h2>
      {/if}
      {#if description}
        <p>{@html marked.parseInline(description)}</p>
      {/if}
      <div>{@html html}</div>
    </td>
  </tr>
</CardTable>

<style>
  h2 {
    font-family: roboto, sans-serif;
    font-size: 18px;
    line-height: 1.2;
    font-weight: 500;
    letter-spacing: normal;
    margin: 5px 0;
    text-transform: uppercase;
    color: rgb(0, 0, 0) !important;
  }

  p {
    font-family: roboto, sans-serif;
    font-size: 12.5px;
    line-height: 1.35;
    font-weight: 400;
    letter-spacing: normal;
    margin: 2px 0 10px 0;
    opacity: 0.9;
    color: #000000;
  }

  div {
    font-family: roboto, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    font-weight: 400;
    letter-spacing: 0.03125em;
    color: #000000;
  }

  div :global(li p) {
    margin: 0;
  }

  div :global(p + ul),
  div :global(p + ol) {
    margin-top: calc(-1em + 4px);
    padding-inline-start: 22px;
  }
</style>
