<script lang="ts">
  import { PUBLIC_NEW_FILESTORE_PATH, PUBLIC_OLD_FILESTORE_PATH } from '$env/static/public';
  import { formatISODate, listOxford } from '$utils';
  import Button, { Icon } from '@smui/button';
  import { renderBlock, type Node } from 'blocks-html-renderer';
  import { marked } from 'marked';
  import { DOMParser } from 'xmldom';

  export let name: string;
  export let href: string;
  export let authors: string[];
  export let date: Date | undefined = undefined;
  export let body: Node[];
  export let buttonText = 'Read more';
  export let hasPassword = false;

  let previewText = body.slice(0, 200) + '…';
  if (DOMParser) {
    const html = renderBlock(body.filter((node) => node.type === 'paragraph'));

    if (html) {
      const dom = new DOMParser().parseFromString(html, 'text/html');

      let _text = '';
      Array.from(dom.childNodes).map((node) => {
        if (node.nodeType === 1) {
          _text += node.textContent + ' ' || '';
        }
      });

      previewText = _text.slice(0, 200) + '…' || '';
    } else {
      previewText = '';
    }

    previewText = previewText.replaceAll(PUBLIC_OLD_FILESTORE_PATH, PUBLIC_NEW_FILESTORE_PATH);
  }
</script>

<article>
  <a {href}><h2>{@html marked.parseInline(name)}</h2> </a>
  {#if hasPassword}
    <Icon
      class="material-icons post-card--lock-icon"
      title="This post requires authentication to view">lock</Icon
    >
  {/if}
  <div>
    {#if authors && authors.length > 0}
      <span>{listOxford(authors)}</span>
    {/if}
    {#if authors && authors.length > 0 && date}
      <span> | </span>
    {/if}
    {#if date}
      <span>{formatISODate(date.toISOString(), false, true, false)}</span>
    {/if}
  </div>
  <p>{previewText}</p>
  <Button variant="outlined" {href}>{buttonText}</Button>
</article>

<style>
  article {
    border: 1px solid rgba(0, 0, 0, 0.2);
    padding: 20px;
    margin: 10px 0;
    position: relative;
  }

  article :global(.post-card--lock-icon) {
    position: absolute;
    top: 20px;
    right: 20px;
    color: var(--color-neutral-160);
    font-size: 20px;
    user-select: none;
    cursor: help;
  }

  h2 {
    font-family: var(--font-headline);
    font-weight: 500;
    letter-spacing: normal;
    text-decoration: inherit;
    text-transform: inherit;
    font-size: 28px;
    display: inline-block;
    line-height: 1.2;
    margin: 5px 0;
  }

  div {
    font-family: var(--font-detail);
    font-size: 14px;
    letter-spacing: normal;
    margin-top: 2px;
    opacity: 0.9;
    margin: 2px 0 15px 0;
  }

  p {
    color: unset;
    border: unset;
    font-family: var(--font-body);
    font-size: 1rem;
    line-height: 1.5rem;
    font-weight: 400;
    letter-spacing: 0.03125em;
    text-decoration: inherit;
    text-transform: inherit;
    margin: 15px 0;
  }

  a {
    color: inherit;
    transition: background-color 0.2s, box-shadow 0.1s, color 0.2s;
    text-decoration: none;
  }
  a:hover {
    box-shadow: 0 2px 0 0 var(--color-primary);
    background-color: hsla(var(--color-primary-hsl), 0.1);
    color: var(--color-primary);
  }
  a:active {
    background-color: hsla(var(--color-primary-hsl), 0.16);
  }
  a:focus-visible {
    box-shadow: 0 0 0 2px var(--color-primary);
  }
</style>
