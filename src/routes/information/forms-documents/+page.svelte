<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Banner from '$components/Banner.svelte';
  import { notEmpty } from '$utils';
  import { Slugger } from 'marked';
  import mime from 'mime-types';
  import { afterUpdate } from 'svelte';
  import type { PageData } from './$houdini';

  const slugger = new Slugger();

  export let data: PageData;
  $: ({ FormsDocumentsPageConfig } = data);
  $: groups = $FormsDocumentsPageConfig.data?.webConfigFormsDocumentsPublic;

  let scrolled = false;
  afterUpdate(() => {
    const elem = document.querySelector($page.url.hash);
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
    scrolled = true;
  });
</script>

<Banner>
  <h1>Forms & Documents</h1>
</Banner>

<div class="cols">
  {#if groups}
    {#each groups.filter(notEmpty) as group}
      <div class="group">
        <h2>{group.label}</h2>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th align="left" style="width: 100%;">File name</th>
                <th align="left" style="width: 20px">Type</th>
                <th align="left" style="width: 20px;">Size</th>
              </tr>
            </thead>
            <tbody>
              {#each group.documents.filter(notEmpty) as doc}
                {@const slug = slugger.slug(doc.name || doc._id)}
                <tr
                  on:click={() =>
                    goto(`https://server.cristata.app/filestore/troop-370/${doc._id}`)}
                  id={slug}
                  class:current={$page.url.hash.slice(1) === slug}
                >
                  <td align="left" style="width: 100%; overflow: hidden; text-overflow: ellipsis;">
                    <a href="https://server.cristata.app/filestore/troop-370/{doc._id}">
                      {doc.name}
                    </a>
                  </td>
                  <td align="left" style="width: 18px">{mime.extension(doc.file_type)}</td>
                  {#if doc.size_bytes / 1000 < 1000}
                    <td align="left" style="width: 22px">{Math.round(doc.size_bytes / 1000)} kB</td>
                  {:else if doc.size_bytes / 1000000 < 1000}
                    <td align="left" style="width: 22px">
                      {Math.round(doc.size_bytes / 1000000)} MB
                    </td>
                  {:else}
                    <td align="left" style="width: 22px"
                      >{Math.round(doc.size_bytes / 1000000000)} GB</td
                    >
                  {/if}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/each}
  {/if}
</div>

<!-- {#if cards}
  <div class="grid">
    {#each cards as card}
      <a href={card.path || './'}>
        <Card>
          <PrimaryAction>
            <img
              alt=""
              src={card.photo_src ||
                'https://troop370atlanta.org/photos/backgrounds/bright-daytime-winter.jpg'}
            />
            <Content>
              <h2>{card.label}</h2>
              <p>{card.caption}</p>
            </Content>
          </PrimaryAction>
        </Card>
      </a>
    {/each}
  </div>
{/if} -->
<style>
  .cols {
    columns: 2;
    column-gap: 20px;

    padding: 35px 20px;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    box-sizing: border-box;

    font-family: var(--font-detail);
    color: var(--color-neutral-180);
    user-select: none;
  }

  .group {
    -webkit-column-break-inside: avoid;
    page-break-inside: avoid;
    break-inside: avoid;

    width: 100%;
    box-shadow: inset 0 0 0 1px rgb(0 0 0 / 10%);
    margin-bottom: 20px;
  }

  h2 {
    font-family: var(--font-headline);
    margin: 0;
    line-height: 1.5;
    font-weight: 500;
    padding: 16px 16px 0 16px;
    font-size: 20px;
    height: 64px;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
  }

  a {
    text-decoration: none;
    color: inherit;
    height: 100%;
    -webkit-user-drag: none;
  }

  a > :global(.mdc-card),
  a > :global(.mdc-card > .mdc-card__primary-action) {
    height: 100%;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  tr {
    font-family: var(--font-detail);
    height: 48px;
    font-size: 14px;
    box-shadow: 0 1px 0 0px rgb(0 0 0 / 10%);
  }

  tbody tr {
    cursor: pointer;
    transition: background-color 0.15s linear;
  }

  tbody tr.current {
    background-color: rgba(255, 217, 0, 0.2);
  }

  tbody tr:hover {
    background-color: rgba(0, 0, 0, 0.08);
    transition: none;
  }

  tbody tr:active {
    background-color: rgba(0, 0, 0, 0.16);
    transition: background-color 0.15s linear;
  }

  tbody tr:last-of-type {
    box-shadow: none;
  }

  th {
    color: rgba(0, 0, 0, 0.6);
  }

  th,
  td {
    padding-right: 32px;
    white-space: nowrap;
  }

  th:first-of-type,
  td:first-of-type {
    padding-left: 16px;
  }
</style>
