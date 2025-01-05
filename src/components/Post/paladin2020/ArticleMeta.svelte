<script lang="ts">
  import { share } from '$components/Post/share';
  import { formatISODate, slugify } from '$utils';
  import { DateTime } from 'luxon';
  import SocialButton from './_SocialButton.svelte';

  export let date: string;
  export let authors: { name: string; photo?: string; slug?: string }[] = [];
  export let articleName: string | undefined = undefined;
  export let articleLocation: string | undefined = undefined;
  export let articleDescription: string | undefined = undefined;

  $: parsed = DateTime.fromISO(date).isValid ? formatISODate(date) : date;

  $: showHeadshots = authors.length <= 2 && authors.every((author) => author.photo);
</script>

<div class={'grid'} class:showHeadshots>
  <div class={'byline'}>
    {#if showHeadshots}
      {#each authors as { photo, ...author }}
        <a
          class="headshot-anchor"
          href={`/profile/${
            author.slug ? author.slug : slugify(author.name.replace(' (Provisional)', ''))
          }`}
        >
          <img
            loading="lazy"
            width="36"
            height="36"
            alt=""
            src={photo}
            sizes="100vw"
            class="article-author-photo"
          />
        </a>
      {/each}
    {/if}
    <div class="byline-text">
      <span>By{' '}</span>
      <!-- display the article authors with the appropriate separators -->
      {#if !authors || authors.length === 0}
        <!-- hide if undefined -->
        {''}
      {:else if authors.length === 1}
        <!-- show author if only one -->
        <a
          href={`/profile/${
            authors[0].slug
              ? authors[0].slug
              : slugify(authors[0].name.replace(' (Provisional)', ''))
          }`}>{authors[0].name.replace(' (Provisional)', '')}</a
        >
      {:else if authors.length === 2}
        <!-- separate with 'and' if two authors -->
        <a
          href={`/profile/${
            authors[0].slug
              ? authors[0].slug
              : slugify(authors[0].name.replace(' (Provisional)', ''))
          }`}>{authors[0].name.replace(' (Provisional)', '')}</a
        >
        <span>{' '}and{' '}</span>
        <a
          href={`/profile/${
            authors[1].slug
              ? authors[1].slug
              : slugify(authors[1].name.replace(' (Provisional)', ''))
          }`}>{authors[1].name.replace(' (Provisional)', '')}</a
        >
      {:else if authors.length > 2}
        <!-- separate with either a comma or ', and' if more than two authors -->
        {#each authors as author, index}
          {#if index === 0}
            <a
              href={`/profile/${
                author.slug ? author.slug : slugify(author.name.replace(' (Provisional)', ''))
              }`}>{author.name.replace(' (Provisional)', '')}</a
            >
          {:else if index === authors.length - 1}
            <span>,{' '}and{' '}</span>
            <a
              href={`/profile/${
                author.slug ? author.slug : slugify(author.name.replace(' (Provisional)', ''))
              }`}>{author.name.replace(' (Provisional)', '')}</a
            >
          {:else}
            <span>,{' '}</span>
            <a
              href={`/profile/${
                author.slug ? author.slug : slugify(author.name.replace(' (Provisional)', ''))
              }`}>{author.name.replace(' (Provisional)', '')}</a
            >
          {/if}
        {/each}
      {/if}
    </div>
  </div>
  <div class={'date'}>
    {parsed}
  </div>
  {#if articleName && articleDescription && articleLocation}
    {@const facebook = share('facebook', articleName, articleDescription, articleLocation) ?? ''}
    {@const twitter = share('twitter', articleName, articleDescription, articleLocation) ?? ''}
    {@const email = share('email', articleName, articleDescription, articleLocation) ?? ''}
    {@const linkedin = share('linkedin', articleName, articleDescription, articleLocation) ?? ''}
    <div class={'social-buttons'}>
      <SocialButton ariaLabel={'share on Facebook'} href={facebook}>
        <svg viewBox="0 0 7 15">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M4.775 14.163V7.08h1.923l.255-2.441H4.775l.004-1.222c0-.636.06-.977.958-.977H6.94V0H5.016c-2.31 0-3.123 1.184-3.123 3.175V4.64H.453v2.44h1.44v7.083h2.882z"
            fill="currentColor"
          />
        </svg>
      </SocialButton>
      <SocialButton ariaLabel={'share on Twitter'} href={twitter}>
        <svg viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z"
          />
        </svg>
      </SocialButton>
      <SocialButton ariaLabel={'share via email'} href={email}>
        <svg viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M13 17H17V14L22 18.5L17 23V20H13V17M20 4H4A2 2 0 0 0 2 6V18A2 2 0 0 0 4 20H11.35A5.8 5.8 0 0 1 11 18A6 6 0 0 1 22 14.69V6A2 2 0 0 0 20 4M20 8L12 13L4 8V6L12 11L20 6Z"
          />
        </svg>
      </SocialButton>
      <SocialButton ariaLabel={'share on LinkedIn'} href={linkedin}>
        <svg viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M18.5 18.5V13.2A3.26 3.26 0 0 0 15.24 9.94C14.39 9.94 13.4 10.46 12.92 11.24V10.13H10.13V18.5H12.92V13.57C12.92 12.8 13.54 12.17 14.31 12.17A1.4 1.4 0 0 1 15.71 13.57V18.5H18.5M6.88 8.56A1.68 1.68 0 0 0 8.56 6.88C8.56 5.95 7.81 5.19 6.88 5.19A1.69 1.69 0 0 0 5.19 6.88C5.19 7.81 5.95 8.56 6.88 8.56M8.27 18.5V10.13H5.5V18.5H8.27Z"
          />
        </svg>
      </SocialButton>
    </div>
  {/if}
</div>

<style>
  .grid {
    margin-top: 30px;
    display: grid;
    grid-row-gap: 0px;
    grid-column-gap: 16px;
    grid-auto-flow: row;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: repeat(auto-fit, minmax(0px, 1fr)) minmax(0px, min-content);
    grid-template-areas:
      'byline   byline        '
      'date     social-buttons';
    align-items: center;
  }
  .grid.showHeadshots {
    grid-row-gap: 4px;
  }
  .byline {
    /* height: 36px; */
    align-self: auto;
    grid-area: byline;
    font-family: var(--font-detail);
    color: var(--color-neutral-dark);
    font-size: 16px;
    /* line-height: 36px; */
    font-weight: 500;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }
  .byline-text {
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    min-height: 36px;
    line-height: 20px;
    white-space: pre-wrap;
    flex-wrap: wrap;
  }
  .byline a:not(.headshot-anchor) {
    color: var(--color-neutral-160);
    text-decoration: none;
    transition:
      background-color 0.2s,
      box-shadow 0.1s;
    flex-grow: 0;
    flex-shrink: 0;
  }
  .byline a:not(.headshot-anchor):hover {
    background-color: hsla(var(--color-primary-hsl), 0.1);
    box-shadow: 0 2px 0 0 var(--color-primary);
  }
  .byline a:not(.headshot-anchor):active {
    background-color: hsla(var(--color-primary-hsl), 0.16);
  }
  .byline img {
    border-radius: 20px;
    margin-right: 8px;
    transition: 200ms;
  }
  .byline .headshot-anchor:hover img {
    border-radius: var(--radius);
    box-shadow: var(--button-shadow-hover);
  }
  .byline .headshot-anchor:active img {
    box-shadow: none;
  }
  .date {
    font-family: var(--font-detail);
    color: var(--color-neutral-dark);
    font-size: 13px;
    line-height: 13px;
    font-weight: 400;
    grid-area: date;
  }
  .social-buttons {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: 10px;
  }
  @media print {
    .social-buttons {
      display: none;
    }
  }
</style>
