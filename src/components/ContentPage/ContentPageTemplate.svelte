<script lang="ts">
  import type { ApiTypes } from '$api';
  import { browser } from '$app/environment';
  import Banner from '$components/Banner.svelte';
  import OutlinedButton from '$components/OutlinedButton.svelte';
  import { Markdown } from '$utils';
  import { MDCRipple } from '@material/ripple';
  import Button, { Label } from '@smui/button';
  import { afterUpdate } from 'svelte';
  import type { AuthStrings } from '../../routes/(standard)/+layout.server';

  export let data: ApiTypes['schemas']['Page'];
  export let authStrings: AuthStrings | undefined = undefined;

  $: quickLinks =
    data.quick_links?.filter(
      (ql): ql is NonNullable<Required<typeof ql>> => !!ql && !!ql.label && !!ql.path
    ) || [];

  $: [headingMD, _bodyMD, toc] = Markdown.parse(data.body || '');
  $: [, alertMD] = data?.alert ? Markdown.parse(data.alert) : [null, '', []];

  $: bodyMD = (() => {
    let bodyMD = _bodyMD;

    if (authStrings) {
      Object.entries(authStrings).forEach(([key, value]) => {
        bodyMD = bodyMD.replaceAll(`{{${key}}}`, value);
      });
    }

    return bodyMD;
  })();

  $: columns = data.dual_columns ? 2 : 1;

  afterUpdate(() => {
    if ((browser && bodyMD) || (browser && alertMD)) {
      const buttonElems = document.querySelectorAll('.mdc-button');
      buttonElems.forEach((buttonElem) => {
        MDCRipple.attachTo(buttonElem);
      });
    }
  });
</script>

<article>
  <Banner>
    {#if headingMD}
      {@html headingMD}
    {:else}
      {@html Markdown.parse(`# ${data.title}`)[0]}
    {/if}
    {#if quickLinks && quickLinks.length > 0}
      <div class="quick-links">
        {#each quickLinks as { path, label }}
          <OutlinedButton href={path || ''}>{label}</OutlinedButton>
        {/each}
      </div>
    {/if}
  </Banner>
  {#if alertMD}
    <div class="alert">
      {@html alertMD}
    </div>
  {/if}
  <div
    id="main-content"
    class:dualColumns={columns === 2}
    class:centerText={data.center_text === true}
  >
    {#if data.show_table_of_contents && toc.length > 0 && columns === 1}
      <aside>
        <h2>Table of contents</h2>
        {#each toc as { title, level, slug }}
          {#if level === 2}
            <div class="toc-h2">
              <a href="#{slug}">{title}</a>
            </div>
          {/if}
          {#if data.toc_h3_enabled && level === 3}
            <div class="toc-h3">
              <a href="#{slug}">{title}</a>
            </div>
          {/if}
        {/each}

        <div class="print-button">
          <Button variant="outlined" on:click={() => window.print()}>
            <Label>Print this page</Label>
          </Button>
        </div>
      </aside>
    {/if}
    {@html bodyMD}
  </div>
</article>

<style>
  article #main-content aside {
    display: flex;
    flex-direction: column;
    gap: 6px;
    border: 1px solid var(--color-neutral-50);
    padding: 20px;
    box-sizing: border-box;
    margin-left: 20px;
    margin-bottom: 20px;
    margin-right: 20px;
  }

  @media (min-width: 700px) {
    article #main-content aside {
      float: right;
      width: 340px;
    }
  }

  article #main-content aside h2 {
    margin: 6px 0 12px 0;
  }

  .toc-h3 {
    margin-left: 20px;
  }

  .alert {
    background-color: var(--color-secondary);
    color: var(--color-neutral-30);
    padding: 35px 20px;
    max-width: 100%;
  }

  article :global(p) {
    margin-top: 0;
    margin-bottom: 15px;
  }

  .alert :global(p) {
    margin-top: 15px;
  }

  article :global(p:last-child) {
    margin-bottom: 0;
  }

  article #main-content > :global(*),
  article .alert > :global(*) {
    max-width: 1200px;
    box-sizing: border-box;
    margin-left: auto;
    margin-right: auto;
    padding: 0 20px;
  }

  article {
    font-family: var(--font-detail);
    line-height: 1.4;
    letter-spacing: 0.03125em;
  }

  article :global(h2),
  .alert :global(h2) {
    font-family: var(--font-headline);
    font-size: 1.5rem;
    font-weight: 500;
    letter-spacing: normal;
    padding-top: 0.7em;
    margin-top: 0;
    margin-bottom: 0.7em;
  }

  article :global(h3),
  .alert :global(h3) {
    font-family: var(--font-headline);
    font-size: 1.25rem;
    font-weight: 500;
    letter-spacing: 0.0125em;
    margin-top: 1.2em;
    margin-bottom: 0.7em;
  }

  div#main-content > :global(*:not(aside) + div[id*='section']:first-of-type) {
    margin-top: calc(35px + (0.7em * 1.5));
  }

  article :global(ul),
  article :global(ol) {
    padding-inline-start: 20px;
  }

  article :global(a.mdc-button--outlined) {
    margin-top: 10px;
    margin-bottom: 5px;
  }

  article :global(a.mdc-button:not(.mdc-button--outlined)) {
    margin-left: -6px;
  }
  article :global(p + p:last-child > a.mdc-button:not(.mdc-button--outlined)) {
    margin-top: -6px;
  }

  article :global(a:not(.mdc-button)) {
    color: var(--color-primary);
    box-shadow: 0 1px 0 0 var(--color-primary);
    transition: background-color 0.2s, box-shadow 0.1s, color 0.2s;
    text-decoration: none;
  }
  article :global(a:hover:not(.mdc-button)) {
    box-shadow: 0 2px 0 0 var(--color-primary);
    background-color: hsla(var(--color-primary-hsl), 0.1);
    color: var(--color-neutral-160);
  }
  article :global(a:active:not(.mdc-button)) {
    background-color: hsla(var(--color-primary-hsl), 0.16);
  }
  article :global(a:focus-visible:not(.mdc-button)) {
    box-shadow: 0 0 0 2px var(--color-primary);
  }

  article :global(div[id*='section']) {
    -webkit-column-break-inside: avoid;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  article :global(:target:before) {
    content: '';
    display: block;
    /* ensure that links to link targets are not cut off by header */
    height: 100px;
    margin: -100px 0 0;
  }

  #main-content {
    padding-top: 35px;
    max-width: 1600px;
    box-sizing: border-box;
    margin: 0 auto;
  }

  #main-content.centerText {
    text-align: center;
  }

  #main-content > :global(div[id*='section']) {
    padding-bottom: 35px;
  }

  @media (min-width: 1000px) {
    #main-content.dualColumns {
      columns: 2;
      column-gap: 20px;
    }
  }

  #main-content :global(img) {
    max-width: 100%;
  }

  .quick-links {
    display: flex;
    flex-direction: row;
    gap: 6px;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    margin-bottom: 5px;
  }

  .quick-links :global(a.mdc-button--outlined) {
    margin: 0;
  }

  #main-content :global(.table-wrapper-inner) {
    width: 100%;
    overflow: auto;
    box-shadow: inset 0 0 0 1px rgb(0 0 0 / 10%);
  }

  #main-content :global(table) {
    width: 100%;
    border-collapse: collapse;
  }

  #main-content :global(tr) {
    font-family: var(--font-detail);
    height: 48px;
    font-size: 14px;
    box-shadow: 0 1px 0 0px rgb(0 0 0 / 10%);
  }

  #main-content :global(tbody tr:last-of-type) {
    box-shadow: none;
  }

  #main-content :global(th) {
    color: rgba(0, 0, 0, 0.6);
  }

  #main-content :global(th),
  #main-content :global(td) {
    padding-right: 32px;
    white-space: nowrap;
  }

  #main-content :global(th:not(:last-of-type)),
  #main-content :global(td:not(:last-of-type)) {
    width: 1px;
  }

  #main-content :global(th:first-of-type),
  #main-content :global(td:first-of-type) {
    padding-left: 16px;
  }

  .print-button {
    width: 100%;
    display: flex;
    margin-top: 20px;
  }

  .print-button > :global(*) {
    flex-grow: 1;
  }

  @media print {
    #main-content {
      padding-top: 0;
    }

    #main-content :global(p) {
      margin-bottom: 8px;
    }

    #main-content :global(p),
    #main-content :global(span),
    #main-content :global(ul),
    #main-content :global(ol) {
      font-size: 14px;
    }

    #main-content :global(h2) {
      padding-top: 0.5em;
      font-size: 1.4rem;
      margin-bottom: 0.5em;
    }
    #main-content :global(h2::before) {
      content: none;
    }

    #main-content :global(h3) {
      font-size: 1.1rem;
    }

    article #main-content aside {
      display: none;
    }

    #main-content :global(tr) {
      font-size: 13px;
      height: 32px;
    }

    #main-content :global(th),
    #main-content :global(td) {
      padding-right: 16px;
    }

    #main-content :global(th:first-of-type),
    #main-content :global(td:first-of-type) {
      padding-left: 8px;
    }
  }
</style>
