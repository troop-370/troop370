<script lang="ts">
  import { onMount } from 'svelte';

  export let doc: string;

  onMount(() => {
    const scriptElem = document.createElement('script');
    scriptElem.type = 'text/javascript';
    scriptElem.src = '/js/iframeResizer.min.js';
    scriptElem.onload = () => {
      // get the resizable iframes
      const resizableIframeElems = document.querySelectorAll('iframe.resize');

      // for each resizable iFrame, set an ID and apply the resize function
      for (let i = 0; i < resizableIframeElems.length; i++) {
        const iframeElem = resizableIframeElems[i];
        iframeElem.id = `resizeIframe${i}`;
        // @ts-expect-error iFrameResize is added via a script element
        window.iFrameResize(
          { log: false, autoResize: true, checkOrigin: false, resizeFrom: 'child' },
          `#resizeIframe${i}`
        );
      }
    };
    document.body.appendChild(scriptElem);
  });

  // find all figures and add click listeners to maximize them
  onMount(() => {
    // get all figures
    // eslint-disable-next-line no-undef
    const figures: NodeListOf<HTMLElement> = document.querySelectorAll('figure.widget');

    figures.forEach((figure) => {
      // center the figure and add a scrim on click
      // and restore it on a second click (or page scroll while centered)
      useFigureFullscreenToggle(figure);
    });
  });

  function useFigureFullscreenToggle(el: HTMLElement) {
    /**
     * Moves the figure to the center of the screen
     */
    function centerFigure() {
      el.style.minWidth = '100%';

      // if the figure will be too tall, split the view so the figure is on the left
      // and the caption is on the right
      const tooTall = el.getBoundingClientRect().height > window.outerHeight;
      if (tooTall) {
        const img = el.querySelector('img');
        if (img) {
          img.style.width = 'auto';
          img.style.maxHeight = `${window.outerHeight - 60}px`;
          img.style.margin = `0 auto`;
        }

        // set to row layout only if caption is present
        const figcaption = el.querySelector('figcaption');
        if (figcaption && figcaption.textContent && figcaption.textContent.length > 0) {
          const imgWrapper: HTMLElement | null = el.querySelector('.img-wrapper');
          if (imgWrapper) {
            el.style.flexDirection = 'row';
            imgWrapper.style.flex = '1';
            figcaption.style.flex = '1';
            figcaption.style.marginLeft = '10px';
          }
        }
      }

      // calculate where to move figure
      const toMove =
        window.outerHeight / 2 -
        (el.getBoundingClientRect().top + (el.getBoundingClientRect().height + 20) / 2); // from 20px margin

      // move figure
      moveFigure(el, toMove, 200);
      el.style.position = `relative`;
      el.style.zIndex = `9999`;
    }

    /**
     * Animates an element into its new location.
     *
     * The animation is a exponential ease out.
     *
     * @param el the element
     * @param topOffset the positive or negative direction for the element's top value (e.g. -145 moves the element 145px up the page)
     * @param time how long to animate in milliseconds
     */
    function moveFigure(el: HTMLElement, topOffset: number, time = 200, invert = false) {
      // remember start time
      const start = Date.now();

      let animation = setInterval(function () {
        // calculate progress from time passed
        let progress = (Date.now() - start) / time;

        // clear the interval once the animation completes
        if (progress >= 1) {
          progress = 1;
          clearInterval(animation);
        }

        // increment top position
        const multiplier = invert ? Math.abs(easeOutExpo(progress) - 1) : easeOutExpo(progress);
        el.style.top = `${topOffset * multiplier}px`;
      }, 20); // run every 20 milliseconds
    }

    /**
     * Fades an element in and out.
     *
     * The animation is a exponential ease out.
     *
     * @param el the element
     * @param direction in or out
     * @param time how long to animate in milliseconds
     */
    function fade(el: HTMLElement, direction: 'in' | 'out' = 'in', time = 200) {
      // remember start time
      const start = Date.now();

      let animation = setInterval(function () {
        // calculate progress from time passed
        let progress = (Date.now() - start) / time;

        // clear the interval once the animation completes
        if (progress >= 1) {
          progress = 1;
          clearInterval(animation);
        }

        // set opacity
        const opacity =
          direction === 'out' ? Math.abs(easeOutExpo(progress) - 1) : easeOutExpo(progress);
        el.style.opacity = `${opacity}`;
      }, 20); // run every 20 milliseconds
    }

    /**
     * Restores a figure to it's normal position in the page flow.
     */
    function restoreFigure() {
      const img = el.querySelector('img');
      const imgWrapper: HTMLElement | null = el.querySelector('.img-wrapper');
      const figcaption = el.querySelector('figcaption');
      if (img && imgWrapper && figcaption) {
        el.style.minWidth = ``;
        el.style.flexDirection = ``;
        img.style.width = ``;
        img.style.maxHeight = ``;
        img.style.margin = ``;
        imgWrapper.style.flex = ``;
        figcaption.style.flex = ``;
        figcaption.style.marginLeft = ``;
        moveFigure(el, parseInt(el.style.top.slice(0, -2)), 200, true);
        setTimeout(() => {
          el.style.zIndex = '';
          el.style.position = ``;
        }, 200);
      }
    }

    /**
     * Adds a scrim to the figure that was clicked.
     *
     * The scrim closes if it is clicked or it is scrolled.
     * @param figure
     */
    function addScrim(figure: HTMLElement) {
      // create scrim
      const scrim = document.createElement('div');
      scrim.style.background = 'white';
      scrim.style.position = 'fixed';
      scrim.style.top = '0';
      scrim.style.right = '0';
      scrim.style.bottom = '0';
      scrim.style.left = '0';
      scrim.style.zIndex = '-1';
      scrim.style.opacity = '0';
      scrim.classList.add('figure-max-scrim');

      // create close button for scrim
      const button = document.createElement('button');
      button.innerHTML = `
      <svg style="width:24px;height:24px" viewBox="0 0 24 24">
        <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
      </svg>
      `;
      button.classList.add('global-icon-button');
      button.classList.add('global-icon-button--outlined');
      button.style.position = 'absolute';
      button.style.top = '20px';
      button.style.right = '20px';
      scrim.appendChild(button);

      // create function to remove scrim
      const removeScrim = () => {
        // fade out scrim
        fade(scrim, 'out', 200);

        // remove once fade complete
        setTimeout(() => scrim.remove(), 200);
      };

      // add listener to scrim to restore figure size on click or scroll
      const listener = (ev: Event) => {
        ev.stopPropagation(); // do not progopgate event up the DOM tree

        restoreFigure();
        removeScrim();

        // clean up document scroll listener
        document.removeEventListener('scroll', listener);

        listen();
      };
      document.addEventListener('scroll', listener);
      scrim.addEventListener('click', listener);

      // append scrim to figure
      figure.appendChild(scrim);

      // fade in scrim
      fade(scrim, 'in', 200);
    }

    function easeOutExpo(x: number): number {
      return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    }

    /**
     * Adds a listener to maximize a figure on click.
     */
    function listen() {
      el.addEventListener(
        'click',
        () => {
          centerFigure();
          addScrim(el);
        },
        { once: true }
      );
    }

    // listener for click
    listen();
  }
</script>

<div class={'article-body'}>
  {@html doc}
</div>

<!-- svelte-ignore css-unused-selector -->
<style>
  div.article-body {
    margin: 30px auto 0;
    font-family: var(--font-body);
    color: var(--color-neutral-dark);
    font-size: 17px;
    line-height: 1.7;
    font-weight: 400;
  }
  :global(.article-body p) {
    margin-top: 0;
    margin-bottom: 10px;
  }
  :global(.article-body p:empty) {
    margin: 0;
  }
  :global(.article-body li > p) {
    margin-bottom: 0;
  }
  :global(.article-body img) {
    max-width: 100%;
    width: 100%;
    height: auto;
  }
  :global(.article-body a:not(.mdc-button)) {
    color: var(--color-primary);
    box-shadow: 0 1px 0 0 var(--color-primary);
    transition:
      background-color 0.2s,
      box-shadow 0.1s,
      color 0.2s;
    text-decoration: none;
  }
  :global(.article-body a:hover:not(.mdc-button)) {
    box-shadow: 0 2px 0 0 var(--color-primary);
    background-color: hsla(var(--color-primary-hsl), 0.1);
    color: var(--color-neutral-160);
  }
  :global(.article-body a:active:not(.mdc-button)) {
    background-color: hsla(var(--color-primary-hsl), 0.16);
  }
  :global(.article-body a:focus-visible:not(.mdc-button)) {
    box-shadow: 0 0 0 2px var(--color-primary);
  }

  /* widget styles */
  :global(.article-body .widget) {
    width: 1px;
    min-width: 100%;
    border: none;
    border-top: 1px solid #cccccc;
    border-bottom: 1px solid #cccccc;
    margin: 20px 0;
    display: flex;
    flex-direction: column;
  }

  /* allow widgets to have special alignment on big-enough screens */
  @media (min-width: 401px) {
    /* left aligned widgets use the left 50% of space and have no borders */
    :global(.article-body .widget.position-left) {
      width: 50%;
      min-width: 50%;
      float: left;
      margin: 10px 20px 10px 0px;
      border: none;
    }
    /* right aligned widgets use the right 50% of space and have no borders*/
    :global(.article-body .widget.position-right) {
      width: 50%;
      min-width: 50%;
      float: right;
      margin: 10px 0px 10px 20px;
      border: none;
    }
  }

  /* no borders for iframes */
  :global(.article-body iframe) {
    border: none;
  }

  /* do not use top and bottom borders for photos/figures */
  :global(.article-body figure.widget) {
    border: none;
  }

  :global(.article-body figure .img-wrapper) {
    position: relative;
    display: flex;
  }

  /* insert photo credit after the figure */
  /*when there is no caption*/
  :global(.article-body figure .img-wrapper::after) {
    content: attr(data-photo-credit);
    display: inline;
    margin: 0;
    font-family: var(--font-body);
    color: var(--color-neutral-lightest);
    font-size: 13px;
    line-height: 20px;
    position: absolute;
    right: 0;
    top: 100%;
  }
  /*when there is a caption*/
  :global(.article-body figure figcaption::after) {
    content: attr(data-photo-credit);
    display: inline;
    margin: -4px 0 0 6px;
    font-family: var(--font-body);
    color: var(--color-neutral-lightest);
    font-size: 13px;
    line-height: 20px;
  }

  /* expand photos/figures into page margins on smaller screens */
  @media screen and (max-width: 600px) {
    :global(.article-body figure.widget:not(.position-left):not(.position-right)) {
      position: relative;
      width: calc(100% + 40px);
      left: -20px;
    }
    :global(.article-body figure:not(.position-left):not(.position-right) .img-wrapper::after) {
      margin: 0 20px;
    }
    :global(.article-body figure:not(.position-left):not(.position-right) figcaption) {
      margin-left: 20px !important;
      margin-right: 20px !important;
    }
  }
  @media screen and (max-width: 400px) {
    :global(.article-body figure.widget) {
      position: relative;
      width: calc(100% + 40px);
      left: -20px;
    }
    :global(.article-body figure .img-wrapper::after) {
      margin: 0 20px;
    }
    :global(.article-body figure figcaption) {
      margin-left: 20px !important;
      margin-right: 20px !important;
    }
  }

  /* headings */
  :global(.article-body h2) {
    font-family: var(--font-headline);
    font-size: 24px;
    font-weight: 500;
    padding: 0.7em 0 0 0;
    margin: 0 0 10px 0;
  }
  :global(.article-body h3) {
    font-family: var(--font-headline);
    font-size: 20px;
    font-weight: 500;
    padding: 0.7em 0 0 0;
    margin: 0 0 10px 0;
  }
  :global(.article-body h4) {
    font-family: var(--font-headline);
    font-size: 17px;
    font-weight: 500;
    padding: 0.7em 0 0 0;
    margin: 0 0 10px 0;
  }

  /* title and subtitle */
  :global(.article-body h1.title) {
    font-size: 48px;
    font-weight: 400;
    margin: 15px 0;
    text-align: center;
    line-height: 1.3;
  }
  :global(.article-body p.subtitle) {
    font-size: 18px;
    text-align: center;
    margin: 15px 0;
  }
  :global(.article-body h1.title + p.subtitle) {
    font-size: 18px;
    text-align: center;
    margin-top: -15px;
  }

  /* hanging indent paragraph */
  :global(.article-body p.hanging) {
    padding-left: 20px;
    text-indent: -20px;
  }

  /* divider */
  :global(.article-body hr::before) {
    content: '•  •  •';
    display: flex;
    justify-content: center;
    white-space: pre;
    margin: 10px;
  }
  :global(.article-body hr) {
    border: none;
  }

  /* tables */
  :global(.article-body table) {
    border-collapse: collapse;
    margin: 0;
    overflow: hidden;
    table-layout: fixed;
    width: 100%;
  }
  :global(.article-body table td),
  :global(.article-body table th) {
    border: 2px solid #ced4da;
    box-sizing: border-box;
    min-width: 1em;
    padding: 3px 5px;
    position: relative;
    vertical-align: top;
  }
  :global(.article-body table td > *),
  :global(.article-body table th > *) {
    margin-bottom: 0;
  }
  :global(.article-body table th) {
    background-color: #f1f3f5;
    font-weight: bold;
    text-align: left;
  }
  :global(.article-body table p) {
    margin: 0;
  }
</style>
