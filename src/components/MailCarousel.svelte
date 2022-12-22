<script lang="ts">
  import { browser } from '$app/environment';
  import { Label } from '@smui/button';
  import Button from '@smui/button/src/Button.svelte';
  import { afterUpdate } from 'svelte';

  export let announcements: {
    title: string | null;
    subtitle: string | null;
    href: string | null;
    href_text: string | null;
    photo: {
      href: string | null;
    } | null;
  }[];

  let flickityElem: HTMLDivElement;
  let flickity: Flickity | undefined = undefined;

  afterUpdate(() => {
    if (browser && document && window.Flickity) {
      // destroy flickity if it already exists so it has the most updated cards
      flickity?.destroy();

      flickity = new window.Flickity(flickityElem, {
        cellAlign: 'left',
        contain: true,
        autoPlay: 4000,
        freeScroll: true,
        pageDots: false,
      });
    }
  });
</script>

<div class="main-carousel" bind:this={flickityElem}>
  {#each announcements as annoucement}
    <div class="carousel-cell" style="background-image:url('{annoucement.photo?.href}');">
      <div class="carousel-text-card ripple-dark-bg ripple-mobile">
        <div>
          <h2 class="carousel-title">{annoucement.title}</h2>
          <p class="carousel-info">{annoucement.subtitle}</p>
          <Button href={annoucement.href || undefined} variant="outlined" class="carousel-button">
            <Label>{annoucement.href_text}</Label>
          </Button>
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  .main-carousel {
    margin-top: -80px;
    height: 300px;
    overflow: hidden;
  }

  .main-carousel:not(.flickity-enabled) {
    white-space: nowrap;
    overflow-y: hidden;
    overflow-x: scroll;
    width: 100%;
    padding-left: 20px;
    padding-right: 20px;
  }

  .main-carousel:not(.flickity-enabled) .carousel-cell {
    display: inline-block;
  }

  @media (max-width: 600px) {
    .main-carousel {
      height: 200px;
    }
  }

  .main-carousel .carousel-title {
    font-family: ibm plex sans, sans-serif;
    font-weight: 500;
    font-size: 34px;
    margin: 0;
  }

  @media (max-width: 600px) {
    .main-carousel .carousel-title {
      font-size: 28px;
    }
  }

  .main-carousel .carousel-info {
    font-family: roboto, sans-serif;
    font-weight: 400;
    font-size: 16px;
    margin: 0;
    padding-bottom: 20px;
    padding-top: 10px;
    color: var(--mdc-theme-text-on-primary);
  }

  .main-carousel :global(.carousel-button) {
    margin: 0;
  }

  .main-carousel :global(.carousel-button:not(:disabled)) {
    color: #fff;
  }

  .main-carousel :global(.carousel-button:not(:disabled)) {
    border-color: #fff;
  }

  .main-carousel :global(.carousel-button .mdc-button__ripple::before),
  .main-carousel :global(.carousel-button .mdc-button__ripple::after) {
    background-color: #fff;
  }

  .main-carousel :global(.carousel-button:hover .mdc-button__ripple::before) {
    opacity: 0.08;
  }

  .main-carousel
    :global(.carousel-button:not(.mdc-ripple-upgraded):focus .mdc-button__ripple::before),
  .main-carousel
    :global(.carousel-button.mdc-ripple-upgraded--background-focused .mdc-button__ripple::before) {
    transition-duration: 75ms;
    opacity: 0.24;
  }

  .main-carousel :global(.carousel-button:not(.mdc-ripple-upgraded) .mdc-button__ripple::after) {
    transition: opacity 150ms linear;
  }

  .main-carousel
    :global(.carousel-button:not(.mdc-ripple-upgraded):active .mdc-button__ripple::after) {
    transition-duration: 75ms;
    opacity: 0.24;
  }

  .main-carousel :global(.carousel-button.mdc-ripple-upgraded) {
    --mdc-ripple-fg-opacity: 0.24;
  }

  .main-carousel :global(.carousel-button:not(:disabled)) {
    color: #fff;
  }

  .main-carousel .carousel-text-card {
    display: block;
    width: 100%;
    background: rgba(0, 0, 0, 0.5);
    height: 100%;
    margin: 0 0 0 auto;
    border-radius: 3px;
    transition: 0.1s;
  }

  .main-carousel .carousel-text-card > div {
    text-align: center;
    color: #fff;
    margin: auto 0;
    position: relative;
    top: 50%;
    transform: perspective(1px) translateY(-50%);
  }

  .main-carousel :global(.flickity-slider) {
    margin: 0 20px;
  }

  .main-carousel .carousel-cell {
    width: calc(33% - (2 / 3) * 20px);
    height: 300px;
    margin-right: 10px;
    background-position: 50%;
    background-repeat: no-repeat;
    background-size: cover;
    border-radius: 3px;
  }

  @media (max-width: 1400px) {
    .main-carousel .carousel-cell {
      width: calc(50% - 20px);
    }
  }

  @media (max-width: 1000px) {
    .main-carousel .carousel-cell {
      width: calc(86% - 20px);
    }
  }

  @media (max-width: 600px) {
    .main-carousel .carousel-cell {
      height: 200px;
    }
  }

  :global(.flickity-button) {
    background: none !important;
  }

  :global(.flickity-button-icon) {
    fill: var(--color-neutral-40);
  }
</style>
