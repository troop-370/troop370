<script lang="ts">
  import { browser } from '$app/environment';
  import Banner from '$components/Banner.svelte';
  import OutlinedButton from '$components/OutlinedButton.svelte';
  import { title } from '$stores/title';
  import { Markdown } from '$utils';
  import { MDCRipple } from '@material/ripple';
  import { afterUpdate } from 'svelte';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ ContentPage } = data);
  $: pageData = $ContentPage.data?.contentBySlugPublic;

  $: title.set(pageData?.name);

  $: quickLinks =
    pageData?.quick_links?.filter(
      (ql): ql is NonNullable<Required<typeof ql>> => !!ql && !!ql.label && !!ql.path
    ) || [];

  $: [headingMD, bodyMD, toc] = pageData?.body ? Markdown.parse(pageData.body) : [null, '', []];
  $: [, alertMD] = pageData?.alert ? Markdown.parse(pageData.alert) : [null, '', []];

  $: columns = pageData?.dual_columns ? 2 : 1;

  afterUpdate(() => {
    if ((browser && bodyMD) || (browser && alertMD)) {
      const buttonElems = document.querySelectorAll('.mdc-button');
      buttonElems.forEach((buttonElem) => {
        MDCRipple.attachTo(buttonElem);
      });
    }
  });
</script>

{#if pageData}
  <article>
    <Banner>
      {#if headingMD}
        {@html headingMD}
      {:else}
        {@html Markdown.parse(`# ${pageData.name}`)[0]}
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
    <div id="main-content" class:dualColumns={columns === 2}>
      {#if pageData.show_table_of_contents && toc.length > 0 && columns === 1}
        <aside>
          <h2>Table of contents</h2>
          {#each toc as { title, level, slug }}
            {#if level === 2}
              <div>
                <a href="#{slug}">{title}</a>
              </div>
            {/if}
          {/each}
        </aside>
      {/if}
      {@html bodyMD}
    </div>
  </article>
{:else if $ContentPage.errors}
  Something went wrong
{/if}

<style>
  article #main-content aside {
    float: right;
    width: 340px;
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

  article #main-content aside h2 {
    margin: 6px 0 12px 0;
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
    line-height: 1.5rem;
    letter-spacing: 0.03125em;
  }

  article :global(h2),
  .alert :global(h2) {
    font-family: var(--font-headline);
    font-size: 1.5rem;
    font-weight: 500;
    letter-spacing: normal;
    margin-top: 0.7em;
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

  #main-content > :global(div[id*='section']) {
    padding-bottom: 35px;
  }

  #main-content.dualColumns {
    columns: 2;
    column-gap: 20px;
  }

  .quick-links {
    display: flex;
    flex-direction: row;
    gap: 6px;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    margin: 10px 0 5px 0;
  }

  .quick-links :global(a.mdc-button--outlined) {
    margin: 0;
  }
</style>
