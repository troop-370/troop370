<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { notEmpty } from '$utils';
  import {
    ArticleBody,
    ArticleCaption,
    ArticleCategories,
    ArticleHeading,
    ArticleMeta,
    ArticlePhoto,
    ArticlePhotoCredit,
    ArticleSubtitle,
  } from './index';

  export let article: {
    name: string;
    description?: string;
    slug?: string;
    categories?: string[];
    video_path?: string;
    video_replaces_photo?: boolean;
    body: string;
    submitted_by?: string[];
    timestamps?: {
      published_at?: string;
    };
    cover_photo?: string;
    cover_photo_credit?: string;
    cover_photo_caption?: string;
  };

  $: shortDate = article.timestamps?.published_at
    ? new Date(article.timestamps.published_at)
    : undefined;
  $: datePath = shortDate
    ? `/${shortDate.getUTCFullYear()}/${shortDate.getUTCMonth() + 1}/${shortDate.getUTCDate()}`
    : '';

  // video embed options
  let video_embed_path: string | null = null;
  if (article && article.video_path) {
    const videoParams = new URLSearchParams(article.video_path.split('?')[1]);
    const videoType: 'youtube' | 'vimeo' | null = article.video_path.indexOf('youtube.com')
      ? 'youtube'
      : article.video_path.indexOf('vimeo.com')
        ? 'vimeo'
        : null;
    const videoId: string | null =
      videoType === 'youtube'
        ? videoParams.get('v')
        : videoType === 'vimeo'
          ? new URL('https://vimeo.com/309904631').pathname.replace('/', '')
          : null;
    video_embed_path =
      videoId === null
        ? null
        : videoType === 'youtube'
          ? `https://www.youtube.com/embed/${videoId}?color=white&rel=0`
          : videoType === 'vimeo'
            ? `https://player.vimeo.com/video/${videoId}?color=ffffff&byline=0&portrait=0`
            : null;
  }

  // keep track of window width
  $: windowWidth = 0;
</script>

<svelte:window bind:innerWidth={windowWidth} />

<svelte:head>
  {#if article?.name}
    <title>{article.name} – Troop 370 Atlanta</title>
  {:else}
    <title>– Troop 370 Atlanta</title>
  {/if}
  {#if article}
    <meta
      property={'og:url'}
      content={`https://troop370atlanta.org/${
        datePath ? `posts/${datePath}/${article.slug}` : `posts/${article.slug}`
      }`}
    />
    <meta property={'og:type'} content={'article'} />
    <meta property={'og:title'} content={article.name} />
    <meta property={'og:description'} content={article.description} />
    <!-- <meta property={'og:image'} content={article.photo_path} /> -->
    <meta property={'og:locale'} content={'en_US'} />
  {/if}
</svelte:head>

<div class="container">
  {#if article}
    <article>
      <!-- cover page -->
      <!-- <CoverPage
        _id={article._id}
        name={article.name}
        publishedAt={article.timestamps.published_at}
        authors={article.people.authors
          .filter((p) => !!p)
          .map((p) => p.name.replace(' (Provisional)', ''))}
        managingEditors={article.people.editors.primary
          .filter((p) => !!p)
          .map((p) => p.name.replace(' (Provisional)', ''))}
        copyEditors={article.people.editors.copy
          .filter((p) => !!p)
          .map((p) => p.name.replace(' (Provisional)', ''))}
      /> -->

      <!-- categories -->
      <ArticleCategories categories={article.categories || []} />

      <!-- heading -->
      <ArticleHeading>{article.name}</ArticleHeading>

      <!-- subtitle -->
      <ArticleSubtitle>{article.description}</ArticleSubtitle>

      <!-- video/photo -->
      {#if video_embed_path && article.video_replaces_photo}
        <div style={'padding: 56.25% 0 0 0; position: relative;'}>
          <iframe
            title={'related video'}
            src={video_embed_path}
            style={'position: absolute; top: 0; left: 0; width: 100%; height: 100%;'}
            frameborder={'0'}
          />
        </div>
      {:else if article.cover_photo}
        <ArticlePhoto src={article.cover_photo} />
        {#if article.cover_photo_caption}
          <ArticleCaption>{article.cover_photo_caption}</ArticleCaption>
        {/if}
        {#if article.cover_photo_credit}
          <ArticlePhotoCredit>{article.cover_photo_credit}</ArticlePhotoCredit>
        {/if}
      {/if}

      <!-- meta info -->
      <ArticleMeta
        date={article.timestamps?.published_at || new Date().toISOString()}
        authors={article.submitted_by?.filter(notEmpty).map((name) => ({ name })) || []}
        articleName={article.name}
        articleLocation={`https://thepaladin.news${$page.url.pathname}`}
        articleDescription={article.description}
      />

      <!-- body -->
      <ArticleBody doc={article.body || ''} />

      <!-- video -->
      {#if video_embed_path && !article.video_replaces_photo}
        <aside>
          <h1>Related video</h1>
          <div style={'padding: 56.25% 0 0 0; position: relative;'}>
            <iframe
              title={'related video'}
              src={video_embed_path}
              style={'position: absolute; top: 0; left: 0; width: 100%; height: 100%;'}
              frameborder={'0'}
            />
          </div>
        </aside>
      {/if}
      <script src="https://player.vimeo.com/api/player.js"></script>
    </article>

    <!-- footer -->
    <div class="clear-float" />
    <!-- <ArticleFooter {article} /> -->
  {/if}
</div>

<style>
  .container {
    width: 100%;
    max-width: 1200px;
    padding: 20px;
    box-sizing: border-box;
    margin: 0 auto;

    --button-light-bg: rgba(128, 128, 128, 0.2);
    --button-light-bg-hover: rgba(105, 81, 194, 0.2);
    --button-light-bg-active: rgba(105, 81, 194, 0.3);
    --button-light-border-color: rgba(128, 128, 128, 0.2);

    --button-shadow-hover: rgb(0 0 0 / 13%) 0px 1.6px 3.6px 0px,
      rgb(0 0 0 / 11%) 0px 0.3px 0.9px 0px;
    --button-shadow-active: rgb(0 0 0 / 13%) 0px 0.8px 3.6px 0px,
      rgb(0 0 0 / 11%) 0px 0.05px 0.9px 0px;

    --font-body: 'Georgia', serif;
  }
  article {
    max-width: 590px;
    margin: 32px auto;
  }
  aside h1 {
    font-family: var(--font-detail);
    color: var(--color-neutral-dark);
    font-size: 22px;
    line-height: 26px;
    font-weight: 700;
    margin: 40px 0 20px 0;
  }
  a:not(.mdc-button) {
    color: var(--color-primary);
    box-shadow: 0 1px 0 0 var(--color-primary);
    transition:
      background-color 0.2s,
      box-shadow 0.1s,
      color 0.2s;
    text-decoration: none;
  }
  a:hover:not(.mdc-button) {
    box-shadow: 0 2px 0 0 var(--color-primary);
    background-color: hsla(var(--color-primary-hsl), 0.1);
    color: var(--color-neutral-160);
  }
  a:active:not(.mdc-button) {
    background-color: hsla(var(--color-primary-hsl), 0.16);
  }
  a:focus-visible:not(.mdc-button) {
    box-shadow: 0 0 0 2px var(--color-primary);
  }

  /* article advertisment */
  :global(.article-adv) {
    width: 100%;
    max-width: 600px;
    height: 0;
    padding: 25% 0 0 0; /* 600px * 25% = 150px height */
  }
  :global(.article-adv-img) {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* print styles */
  @media print {
    :global(.article-adv),
    .more-from,
    :global(.article-footer) {
      display: none;
    }
    article {
      width: 100%;
      max-width: 100%;
      margin: 0;
    }
    :global(.article-body a),
    :global(.article-footer a) {
      color: var(--color-neutral-dark) !important;
    }
    :global(.article-body a::after) {
      content: ' (' attr(href) ') ';
      word-break: break-all;
      box-shadow: 0 2px 0 1.5px white;
      color: #999 !important;
    }
    :global(.hide-print) {
      display: none !important;
    }
  }
  @page {
    margin: 0.5in;
  }

  .clear-float {
    clear: both;
  }
</style>
