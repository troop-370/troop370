<div class="page-header-banner">
  <slot />
</div>

<style>
  .page-header-banner {
    max-width: 1200px;
    box-sizing: border-box;
    margin-left: auto;
    margin-right: auto;
    padding: 0 20px;

    text-align: center;
    background-color: var(--color-primary);
    color: var(--color-neutral-30);
    padding: 80px 20px;
    max-width: 100%;
    display: flex;
    flex-direction: column;

    font-family: var(--font-detail);
    line-height: 1.5rem;
    letter-spacing: 0.03125em;
  }

  .page-header-banner :global(h1) {
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

  .page-header-banner :global(p) {
    margin-top: 15px;
    margin-bottom: 15px;
  }

  .page-header-banner > :global(*) {
    max-width: 1200px;
    box-sizing: border-box;
    margin-left: auto;
    margin-right: auto;
    padding: 0 20px;
  }

  .page-header-banner :global(a:not(.mdc-button)) {
    color: var(--color-neutral-30);
    box-shadow: 0 1px 0 0 var(--color-neutral-30);
    transition: background-color 0.2s, box-shadow 0.1s, color 0.2s;
    text-decoration: none;
  }
  .page-header-banner :global(a:hover:not(.mdc-button)) {
    box-shadow: 0 2px 0 0 var(--color-neutral-30);
    background-color: hsla(0, 0%, 100%, 0.1);
    color: var(--color-neutral-10);
  }
  .page-header-banner :global(a:active:not(.mdc-button)) {
    background-color: hsla(0, 0%, 100%, 0.16);
  }
  .page-header-banner :global(a:focus-visible:not(.mdc-button)) {
    box-shadow: 0 0 0 2px var(--color-neutral-30);
  }
</style>
