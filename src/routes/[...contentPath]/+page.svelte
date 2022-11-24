<script lang="ts">
  import { browser } from '$app/environment';
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

  $: [headingMD, bodyMD] = pageData?.body ? Markdown.parse(pageData.body) : [null, ''];
  $: [, alertMD] = pageData?.alert ? Markdown.parse(pageData.alert) : [null, ''];

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
    <div class="banner">
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
    </div>
    {#if alertMD}
      <div class="alert">
        {@html alertMD}
      </div>
    {/if}
    <div id="main-content" class:dualColumns={columns === 2}>
      {@html bodyMD}
    </div>
  </article>
{:else if $ContentPage.errors}
  Something went wrong
{/if}

<pre>{JSON.stringify($ContentPage.data, null, 2)}</pre>

<style>
  .alert {
    background-color: var(--color-secondary);
    color: var(--color-neutral-30);
    padding: 35px 20px;
    max-width: 100%;
  }

  article .banner :global(h1) {
    color: var(--color-neutral-10);
    font-family: var(--font-headline);
    font-size: 2.125rem;
    line-height: 2.5rem;
    font-weight: 500;
    letter-spacing: 0.00735294em;
    margin-top: 5px;
    margin-bottom: 5px;
    line-height: 1.5;
  }

  article :global(p) {
    margin-top: 0;
    margin-bottom: 15px;
  }
  .banner :global(p),
  .alert :global(p) {
    margin-top: 15px;
  }

  article :global(p:last-child) {
    margin-bottom: 0;
  }

  article #main-content > :global(*),
  article .banner > :global(*),
  article .alert > :global(*) {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    padding: 0 20px;
  }

  article {
    font-family: var(--font-detail);
    line-height: 1.5rem;
    letter-spacing: 0.03125em;
  }

  article .banner {
    text-align: center;
    background-color: var(--color-primary);
    color: var(--color-neutral-30);
    padding: 80px 20px;
    max-width: 100%;
    display: flex;
    flex-direction: column;
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

  div#main-content > :global(* + div[id*='section']:first-of-type) {
    margin-top: calc(35px + (0.7em * 1.5));
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

  #main-content {
    padding-top: 35px;
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
