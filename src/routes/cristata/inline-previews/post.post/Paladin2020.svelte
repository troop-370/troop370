<script lang="ts">
  import { browser } from '$app/environment';
  import {
    ArticleCaption,
    ArticleCategories,
    ArticleHeading,
    ArticleMeta,
    ArticlePhoto,
    ArticlePhotoCredit,
    ArticleSubtitle,
  } from '$components/Post/paladin2020';
  import { z } from 'zod';
  import type { validator } from './validator';
  import Warnings from './Warnings.svelte';

  export let fields: z.infer<typeof validator>;

  let video_embed_path: string | null = null;
  // if (fields && fields.video_path) {
  //   const videoParams = new URLSearchParams(fields.video_path.split('?')[1]);
  //   const videoType: 'youtube' | 'vimeo' | null = fields.video_path.indexOf('youtube.com')
  //     ? 'youtube'
  //     : fields.video_path.indexOf('vimeo.com')
  //       ? 'vimeo'
  //       : null;
  //   const videoId: string | null =
  //     videoType === 'youtube'
  //       ? videoParams.get('v')
  //       : videoType === 'vimeo'
  //         ? new URL('https://vimeo.com/309904631').pathname.replace('/', '')
  //         : null;
  //   video_embed_path =
  //     videoId === null
  //       ? null
  //       : videoType === 'youtube'
  //         ? `https://www.youtube.com/embed/${videoId}?color=white&rel=0`
  //         : videoType === 'vimeo'
  //           ? `https://player.vimeo.com/video/${videoId}?color=ffffff&byline=0&portrait=0`
  //           : null;
  // }

  $: categories = fields.category.map((category) => category.label);
  $: heading = fields.title;
  $: slug = fields.slug;
  $: deck = fields.subtitle;
  $: videoReplacesPhoto = false;
  $: photoPath = fields.cover_photo.url;
  $: photoCaption = fields.cover_photo_caption;
  $: photoCredit = fields.cover_photo.credit;
  $: date = fields.shortPublishedAt || fields.publishedAt || new Date().toISOString();
  $: authors = fields.submitted_by?.map((name) => name.trim()).map((name) => ({ name })) || [];
</script>

{#if browser}
  <style>
    html,
    body,
    #svelte {
      height: unset;
    }
  </style>
{/if}

<div class="content">
  <Warnings data={fields} />

  <div class="tiptap-top-article-jackbuehner2020" id={'preview'}>
    {#if fields}
      <!-- categories -->
      {#if categories}
        <ArticleCategories {categories} />
      {/if}

      <!-- heading -->
      {#if heading}
        <ArticleHeading>{heading}</ArticleHeading>
      {/if}

      <!-- subtitle -->
      {#if deck}
        <ArticleSubtitle>{deck}</ArticleSubtitle>
      {/if}

      <!-- video/photo -->
      {#if video_embed_path && videoReplacesPhoto}
        <div style={'padding: 56.25% 0 0 0; position: relative;'}>
          <iframe
            title={'related video'}
            src={video_embed_path}
            style={'position: absolute; top: 0; left: 0; width: 100%; height: 100%;'}
            frameborder={'0'}
          />
        </div>
      {:else if photoPath}
        <ArticlePhoto src={photoPath} />
        {#if photoCaption}
          <ArticleCaption>{photoCaption}</ArticleCaption>
        {/if}
        {#if photoCredit}
          <ArticlePhotoCredit>{photoCredit}</ArticlePhotoCredit>
        {/if}
      {/if}

      <!-- meta info -->
      {#if date && authors}
        <ArticleMeta {date} {authors} />
      {/if}
    {/if}
  </div>
  <div class="tiptap-top-article-jackbuehner2020" id={'emailPreview'}>
    {#if fields}
      <!-- categories -->
      {#if categories}
        <ArticleCategories {categories} />
      {/if}

      <!-- heading -->
      {#if heading}
        <ArticleHeading>{heading}</ArticleHeading>
      {/if}

      <!-- subtitle -->
      {#if deck}
        <ArticleSubtitle>{deck}</ArticleSubtitle>
      {/if}

      <!-- video/photo -->
      {#if photoPath}
        <ArticlePhoto src={photoPath} />
        {#if photoCaption}
          <ArticleCaption>{photoCaption}</ArticleCaption>
        {/if}
        {#if photoCredit}
          <ArticlePhotoCredit>{photoCredit}</ArticlePhotoCredit>
        {/if}
      {/if}

      <!-- meta info -->
      {#if date && authors}
        <ArticleMeta {date} {authors} />
      {/if}
    {/if}
  </div>
</div>

<style>
  .content {
    padding-top: 20px;
    margin-bottom: -1px;

    --font-body: 'Georgia', serif;
    font-variant: lining-nums;
  }
  @media (prefers-color-scheme: dark) {
    .content {
      background-color: #202020;
    }
  }

  #preview {
    max-width: 768px;
    width: calc(100% - 40px);
    margin: 0 auto;
    background: white;
    padding: 68px 88px 30px;
    border: 1px solid rgb(171, 171, 171);
    border-bottom: none;
    box-sizing: border-box;
  }

  @media (max-width: 680px) {
    #preview {
      max-width: unset;
      width: 100%;
      margin: 0 auto;
      padding: 24px 20px 0 20px;
    }
  }

  #emailPreview {
    display: none;
  }

  :global(div.tiptap-top-article-jackbuehner2020 > div:first-of-type) {
    margin-top: 0;
  }
</style>
