<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import Banner from '$components/Banner.svelte';
  import { scrollTop } from '$stores/scrollTop';
  import { title } from '$stores/title';
  import { Markdown } from '$utils';
  import { MDCRipple } from '@material/ripple';
  import Button, { Icon } from '@smui/button';
  import Tab, { Label } from '@smui/tab';
  import TabBar from '@smui/tab-bar';
  import { afterUpdate, onDestroy, onMount } from 'svelte';
  import { mountStore } from './mountStore';

  export let data;

  title.set('Pine Straw Store');

  let active = 'Pine Straw';

  $: [, _bodyMD] = Markdown.parse(data.page.body || '');

  $: bodyMD = (() => {
    let bodyMD = _bodyMD;

    if (data.authStrings) {
      Object.entries(data.authStrings).forEach(([key, value]) => {
        bodyMD = bodyMD.replaceAll(`{{${key}}}`, value);
      });
    }

    return bodyMD;
  })();

  onMount(() => {
    mountStore('store-browser', '37484300');
  });

  afterUpdate(() => {
    if (browser && bodyMD) {
      const buttonElems = document.querySelectorAll('.mdc-button');
      buttonElems.forEach((buttonElem) => {
        MDCRipple.attachTo(buttonElem);
      });
    }
  });

  const hashes = {
    pinestraw: '#!/Pine-Straw/c/37484300',
    cart: '#!/~/cart',
    checkoutAddress: '#!/~/checkoutAddress',
    checkoutDelivery: '#!/~/checkoutDelivery',
    checkoutPD: '#!/~/checkoutPD',
    accountSettings: '#!/~/account',
    accountChangeEmail: '#!/~/account/change-email=true',
    orderConfirmationPrefix: '#!/~/orderConfirmation/orderId=',
  };

  let currentHash = $page.url.hash;

  const hashListener = (ev: HashChangeEvent) => {
    const { hash } = new URL(ev.newURL);
    currentHash = hash;

    if (hash === hashes.cart) active = 'Cart';
    else if (hash === hashes.checkoutAddress) active = 'Cart';
    else if (hash === hashes.checkoutDelivery) active = 'Cart';
    else if (hash === hashes.checkoutPD) active = 'Cart';
    else if (hash === hashes.accountSettings) active = 'Account';
    else if (hash === hashes.accountChangeEmail) active = 'Account';
    else if (hash.slice(0, 31) === hashes.orderConfirmationPrefix) active = 'Account';
    else active = 'Pine Straw';
  };
  onMount(() => {
    if (browser && window) window.addEventListener('hashchange', hashListener);
  });
  onDestroy(() => {
    if (browser && window) window.removeEventListener('hashchange', hashListener);
  });

  export let windowWidth = 0;
</script>

<svelte:window bind:innerWidth={windowWidth} />

<Banner className="pinestraw-banner">
  <h1>Pine Straw Fundraiser</h1>
  <p>Support scouting by purchasing premium long leaf pine straw.</p>
  <span style="height: 48px; display: block;" />
</Banner>

<div class="wrapper">
  <TabBar
    tabs={['Pine Straw', 'Cart', 'Account']}
    let:tab
    bind:active
    class="tabbar {$scrollTop < 264 && windowWidth > 600 ? 'transparent' : ''}"
  >
    <Tab
      {tab}
      on:click={() => {
        if (tab === 'Pine Straw') window.location = hashes.pinestraw;
        if (tab === 'Cart') window.location = hashes.cart;
        if (tab === 'Account') window.location = hashes.accountSettings;
      }}
    >
      <Label>{tab}</Label>
    </Tab>
  </TabBar>

  <div id="content">
    {#if active === 'Pine Straw'}
      <article>
        {@html bodyMD}
      </article>
    {/if}

    {#if active === 'Pine Straw' && currentHash !== hashes.pinestraw && currentHash !== ''}
      <Button
        variant="text"
        on:click={() => (window.location = hashes.pinestraw)}
        style="
          margin-top: 35px;
          margin-bottom: -15px;
          position: sticky;
          top: 68px;
          {$scrollTop > 1320
          ? `background: var(--color-neutral-10);
          z-index: 10;
          box-shadow: 0 2px 4px -1px rgb(0 0 0 / 10%), 0 4px 5px 0 rgb(0 0 0 / 7%), 0 1px 10px 0 rgb(0 0 0 / 6%)`
          : ''}
        "
      >
        <Icon class="material-icons">arrow_back</Icon>
        Return to store home
      </Button>
    {/if}

    <div id="store-browser" style="background:none;min-height:100px;" />
  </div>
</div>

<style>
  .wrapper {
    position: relative;
    margin-top: -48px;
  }

  :global(.pinestraw-banner) {
    background-image: url(/photos/backgrounds/pineneedles_l.jpg);
    background-color: #555 !important;
    background-blend-mode: multiply;
  }

  @media (max-width: 600px) {
    :global(.pinestraw-banner) {
      padding: 30px 10px !important;
    }

    :global(.pinestraw-banner p) {
      margin: 5px 0 !important;
    }
  }

  :global(.tabbar) {
    position: sticky;
    top: 0;
    z-index: 98;
    background-color: var(--color-neutral-10);
    box-shadow: 0 2px 4px -1px rgb(0 0 0 / 10%), 0 4px 5px 0 rgb(0 0 0 / 7%),
      0 1px 10px 0 rgb(0 0 0 / 6%);
    transition: background-color 100ms, box-shadow 200ms;
  }

  :global(.tabbar.transparent) {
    background-color: transparent;
    /* box-shadow: none; */
    --mdc-ripple-color: var(--color-neutral-10);
  }

  :global(.tabbar .mdc-tab__text-label) {
    transition: none;
    transition-delay: none;
  }
  :global(.tabbar.transparent .mdc-tab__text-label) {
    color: var(--color-neutral-10);
  }

  :global(.tabbar.transparent .mdc-tab-indicator .mdc-tab-indicator__content--underline) {
    border-color: var(--color-neutral-10);
  }

  #content {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 35px 20px;
    box-sizing: border-box;
  }

  article :global(div[id='section__order'] .mdc-button:first-of-type) {
    display: none;
  }

  article {
    font-family: var(--font-detail);
    line-height: 1.4rem;
    letter-spacing: 0.03125em;
    color: var(--color-neutral-180);
  }

  article :global(h2) {
    font-family: var(--font-headline);
    font-size: 1.5rem;
    font-weight: 500;
    letter-spacing: normal;
    padding-top: 0.7em;
    margin-top: 0;
    margin-bottom: 0.7em;
  }

  article :global(h3) {
    font-family: var(--font-headline);
    font-size: 1.25rem;
    font-weight: 500;
    letter-spacing: 0.0125em;
    margin-top: 1.2em;
    margin-bottom: 0.7em;
  }

  .wrapper :global(p a:not(.mdc-button)),
  .wrapper :global(article a:not(.mdc-button)) {
    color: var(--color-primary) !important;
    box-shadow: 0 1px 0 0 var(--color-primary) !important;
    transition: background-color 0.2s, box-shadow 0.1s, color 0.2s !important;
    text-decoration: none !important;
  }
  .wrapper :global(p a:hover:not(.mdc-button)),
  .wrapper :global(article a:hover:not(.mdc-button)) {
    box-shadow: 0 2px 0 0 var(--color-primary) !important;
    background-color: hsla(var(--color-primary-hsl), 0.1) !important;
    color: var(--color-neutral-160) !important;
  }
  .wrapper :global(p a:active:not(.mdc-button)),
  .wrapper :global(article a:active:not(.mdc-button)) {
    background-color: hsla(var(--color-primary-hsl), 0.16) !important;
  }
  .wrapper :global(p a:focus-visible:not(.mdc-button)),
  .wrapper :global(article a:focus-visible:not(.mdc-button)) {
    box-shadow: 0 0 0 2px var(--color-primary) !important;
  }

  article :global(h2),
  article :global(h3) {
    color: var(--color-neutral-180);
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

  :global(.ec-page-title) {
    display: none;
  }

  :global(html#ecwid_html body#ecwid_body #store-browser .ec-wrapper > .ec-store) {
    font-family: var(--font-detail);
    color: var(--color-neutral-180);
    line-height: 1.4rem;
    letter-spacing: 0.03125em;
    padding: 35px 0;
  }

  :global(html#ecwid_html body#ecwid_body #store-browser .ec-wrapper .ec-grid) {
    margin: 0;
  }

  :global(html#ecwid_html body#ecwid_body #store-browser .ec-wrapper .ec-header-h1) {
    font-family: var(--font-headline);
    font-weight: 500;
    letter-spacing: normal;
  }

  :global(html#ecwid_html body#ecwid_body #store-browser .ec-wrapper .ec-header-h2) {
    font-family: var(--font-headline);
    font-weight: 500;
    letter-spacing: normal;
  }

  :global(html#ecwid_html body#ecwid_body #store-browser .ec-wrapper .ec-header-h3) {
    font-family: var(--font-headline);
    font-weight: 500;
    letter-spacing: normal;
  }

  :global(html#ecwid_html body#ecwid_body #store-browser .ec-wrapper .ec-header-h4) {
    font-family: var(--font-headline);
    font-weight: 500;
    letter-spacing: 0.0125em;
  }

  :global(html#ecwid_html body#ecwid_body #store-browser .ecwid-productBrowser) {
    padding: 0;
    background-color: transparent;
  }

  :global(html#ecwid_html body#ecwid_body #store-browser .form-control__button) {
    font-family: var(--font-headline);
    letter-spacing: 0.0125em;
    min-height: 36px;
    text-transform: uppercase;
    font-family: var(--font-headline);
    font-weight: 700;
    font-size: 14px;
    box-sizing: border-box;
  }
</style>
