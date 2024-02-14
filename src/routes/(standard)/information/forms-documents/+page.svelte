<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Banner from '$components/Banner.svelte';
  import {
    PUBLIC_API_URL,
    PUBLIC_NEW_FILESTORE_PATH,
    PUBLIC_OLD_FILESTORE_PATH,
  } from '$env/static/public';
  import { notEmpty } from '$utils';
  import { Slugger } from 'marked';
  import mime from 'mime-types';
  import { afterUpdate } from 'svelte';

  const slugger = new Slugger();

  export let data;

  let scrolled = false;
  afterUpdate(() => {
    if (browser && document && $page.url.hash) {
      const elem = document.querySelector($page.url.hash);
      if (elem) {
        const elemPosition = elem.getBoundingClientRect().top;
        window.scrollTo({
          top: elemPosition - 80,
          behavior: 'smooth',
        });
      }
      scrolled = true;
    }
  });

  function processGroup(group: NonNullable<NonNullable<typeof data.fileGroups>[0]>) {
    if (group.label === 'General Applications') {
      return {
        ...group,
        documents: [
          ...(group.documents?.data || [])
            .map((d) => d.attributes)
            .filter(notEmpty)
            .filter(
              (doc) =>
                doc.name !== 'Merit Badge Counselor Application' &&
                doc.name !== 'Youth Registration Instructions' &&
                doc.name !== 'Adult Registration Instructions'
            ),
          {
            name: 'Merit Badge Counselor Application',
            ext: 'url',
            size: 0,
            url: 'https://www.atlantabsa.org/mbcounselor',
          },
          // {
          //   name: 'Health Form (Annotated)',
          //   mime: 'url',
          //   size: 0,
          //   _id: 'https://troop370atlanta.org/healthform',
          // },
          {
            name: 'Youth Registration Instructions',
            ext: 'url',
            size: 0,
            url: 'https://troop370atlanta.org/join',
          },
          {
            name: 'Adult Registration Instructions',
            ext: 'url',
            size: 0,
            url: 'https://troop370atlanta.org/join',
          },
        ],
      };
    }
    return {
      ...group,
      documents: (group.documents?.data || []).map((d) => d.attributes).filter(notEmpty),
    };
  }
</script>

<Banner>
  <h1>Forms & Documents</h1>
</Banner>

<div class="cols">
  {#if data.fileGroups}
    {#each data.fileGroups.filter(notEmpty).map(processGroup) as group}
      <div class="group">
        <h2>{group.label}</h2>
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
              {@const name =
                doc.alternativeText ||
                doc.name?.split('.').slice(0, -1).join('.') ||
                doc.name ||
                ''}
              {@const slug = slugger.slug(name)}
              {@const size_bytes = doc.size * 1000 || 0}
              {@const url = doc.url
                ? doc.url.startsWith('/')
                  ? `${PUBLIC_API_URL.replace('/api', '')}${doc.url}`
                  : doc.url.replace(PUBLIC_OLD_FILESTORE_PATH, PUBLIC_NEW_FILESTORE_PATH)
                : ''}
              <tr
                on:click={() => goto(url)}
                id={slug}
                class:current={$page.url.hash.slice(1) === slug}
              >
                <td align="left" style="width: 100%; overflow: hidden; text-overflow: ellipsis;">
                  <a href={url}>
                    {name}
                  </a>
                </td>
                <td align="left" style="width: 18px">
                  {#if doc.ext === 'url'}
                    url
                  {:else}
                    {doc.ext?.slice(1) || mime.extension(doc.mime || '')}
                  {/if}
                </td>
                {#if size_bytes === 0}
                  <td align="left" style="width: 22px" />
                {:else if size_bytes / 1000 < 1000}
                  <td align="left" style="width: 22px">{Math.round(size_bytes / 1000)} kB</td>
                {:else if size_bytes / 1000000 < 1000}
                  <td align="left" style="width: 22px">
                    {Math.round(size_bytes / 1000000)} MB
                  </td>
                {:else}
                  <td align="left" style="width: 22px">
                    {Math.round(size_bytes / 1000000000)} GB
                  </td>
                {/if}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/each}
  {/if}
</div>

<style>
  .cols {
    columns: 1;
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

  @media (min-width: 1000px) {
    .cols {
      columns: 2;
    }
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
