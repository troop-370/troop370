<script lang="ts">
  import { browser } from '$app/environment';
  import { afterUpdate } from 'svelte';

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
        lazyLoad: 3,
        imagesLoaded: true,
      });
    }
  });
</script>

<div class="img-carousel" bind:this={flickityElem}>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/1.jpg"
      alt="Preparing to hike at Okpik"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/2.jpg"
      alt="Sitting on a tree"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/3.jpg"
      alt="Whitewater rafting on the Nantahala River"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/4.jpg"
      alt="A group of first-year scouts at Woodruff Scout Reservation during sumer camp"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/5.jpg"
      alt="Running around at the S-Games campout"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/6.jpg"
      alt="Scuba diving"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/7.jpg"
      alt="Group of Troop 370 scouts that attended the National Scout Jamboree in 2017"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/8.jpg"
      alt="Mountain biking"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/9.jpg"
      alt="Costumes for the cracker barrel at summer camp"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/10.jpg"
      alt="Group of scouts at a waterfall"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/11.jpg"
      alt="Scouts huddled together to avoid the cold wind on the short boat trip to Dog Island"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/12.jpg"
      alt="Sharing the peacelight"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/13.jpg"
      alt="Orienteering in the snow"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/14.jpg"
      alt="Lunch break at a service project to refurbish the front area of High Point Episcopal Community Church"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/15.jpg"
      alt="Removing English Ivy from the playground at High Point Episcopal Community Church"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/16.jpg"
      alt="Canoeing at Norther Tier High Adventure Base"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/17.jpg"
      alt="Northern Tier Crew - 2017"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/18.jpg"
      alt="Whitewater rafting on the Nantahala River"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/19.jpg"
      alt="Playing Ga-Ga at Woodruff"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/20.jpg"
      alt="Campfire stories"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/21.jpg"
      alt="Learning how to take care of a car at Automotive Maintenance merit badge"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/22.jpg"
      alt="Getting equipment for Northern Tier"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/23.jpg"
      alt="Working at the Pine Straw Sale"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/24.jpg"
      alt="Snow Bear primitive skills campout"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/25.jpg"
      alt="Preparing to cook at the Scout Weekend campout"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/26.jpg"
      alt="Sitting at the top of a mountain in Georgia"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/27.jpg"
      alt="Climbing on an old tree at Dog Island"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/28.jpg"
      alt="Lined up for the morning flag ceremony at Woodruff Summer Camp"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/29.jpg"
      alt="Eating chicken and dumplings for dinner"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/30.jpg"
      alt="Attempting to start a fire by friction"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/31.jpg"
      alt="Dinner on a campout"
    />
  </div>
  <div class="carousel-cell ">
    <img
      class="carousel-image"
      data-flickity-lazyload="img/index-slideshow/32.jpg"
      alt="Rock climbing"
    />
  </div>
</div>

<style>
  .img-carousel {
    transition: height 0.1s;
    overflow: hidden;
  }

  .img-carousel:not(.flickity-enabled) {
    white-space: nowrap;
    overflow-y: hidden;
    overflow-x: scroll;
    width: 100%;
    padding-left: 20px;
    padding-right: 20px;
  }

  .img-carousel:not(.flickity-enabled) .carousel-cell {
    display: inline-block;
  }

  @media (max-width: 600px) {
    .img-carousel {
      height: 300px;
    }
  }

  .img-carousel :global(.flickity-slider) {
    margin: 0 20px;
  }

  .img-carousel .carousel-cell {
    margin-right: 10px;
    border-radius: 3px;
    background-color: #212121;
    transition: height 0.1s;
  }

  @media (max-width: 800px) /*standard width of images */ {
    .img-carousel .carousel-cell {
      width: 100%;
    }
  }

  .img-carousel .carousel-image {
    display: block;
    min-width: 200px;
    height: 600px;
    border-radius: 3px;
  }

  @media (max-width: 800px) /*standard width of images */ {
    .img-carousel .carousel-image {
      height: 300px;
      margin: auto;
    }
  }

  :global(.flickity-button) {
    background: none !important;
  }

  :global(.flickity-button-icon) {
    fill: var(--color-neutral-40);
  }
</style>
