<script lang="ts">
  import { afterNavigate, invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';
  import { Breadcrumbs } from '$lib/components/ui/breadcrumb';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';

  export let data;

  afterNavigate(({ from, to }) => {
    if (!from?.route.id || !to?.route.id) return;

    // if we have navigated here from a child route
    // (likely via breadcrumbs)
    // invalidate this route to prevent stale data
    if (from.route.id.startsWith(to.route.id)) {
      console.log('invalidating');
      invalidateAll();
    }
  });
</script>

<div class="wrapper">
  <div id="content">
    <div class="breadcrumbs">
      <Breadcrumbs items={data.session['store.pinestraw.checkout.breadcrumbs']} />
    </div>

    {#if $page.form?.error}
      <aside style="margin-bottom: 1rem;">
        <Card
          style="border-color: hsla(var(--destructive) / 50%); background-color: hsla(var(--destructive) / 8%);"
        >
          <CardHeader>
            <CardTitle tag="h1">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              {$page.form?.error}
            </p>
          </CardContent>
        </Card>
      </aside>
    {/if}

    <slot></slot>
  </div>
</div>

<style>
  .wrapper {
    background-color: hsl(0, 0%, 98.5%);
    height: 100%;
    min-height: calc(100vh - 56px);
  }

  .breadcrumbs {
    margin-bottom: 1rem;
  }

  #content {
    width: 100%;
    max-width: 74rem;
    margin: 0 auto;
    padding: 1rem;
    box-sizing: border-box;
  }

  #content :global(p) {
    margin-block-start: 0.5em;
    margin-block-end: 0.5em;
  }
  #content :global(p:first-child) {
    margin-block-start: 0;
  }
  #content :global(p:last-child) {
    margin-block-end: 0;
  }

  #content :global(p a:not([data-button-root])),
  #content :global(article a:not([data-button-root])) {
    color: hsl(var(--primary)) !important;
    box-shadow: 0 1px 0 0 hsl(var(--primary)) !important;
    transition:
      background-color 0.2s,
      box-shadow 0.1s,
      color 0.2s !important;
    text-decoration: none !important;
  }
  #content :global(p a:hover:not([data-button-root])),
  #content :global(article a:hover:not([data-button-root])) {
    box-shadow: 0 2px 0 0 hsl(var(--primary)) !important;
    background-color: hsla(var(--primary) / 0.1) !important;
    color: var(--color-neutral-160) !important;
  }
  #content :global(p a:active:not([data-button-root])),
  #content :global(article a:active:not([data-button-root])) {
    background-color: hsla(var(--primary) / 0.16) !important;
  }
  #content :global(p a:focus-visible:not([data-button-root])),
  #content :global(article a:focus-visible:not([data-button-root])) {
    box-shadow: 0 0 0 2px hsl(var(--primary)) !important;
  }

  #content :global(.input > *:not(:first-child)) {
    margin-top: 0.5rem;
  }
  #content :global(.input + .input) {
    margin-top: 0.5rem;
  }

  #content :global(.checkbox-group) {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  #content :global(.checkbox) {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    align-items: center;
  }

  #content :global(.checkbox-group .checkbox label) {
    font-weight: 400;
  }

  #content :global(.radio-group) {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }

  #content :global(input[type='radio']) {
    width: 1rem;
    height: 1rem;
    accent-color: hsl(var(--primary) / var(--tw-text-opacity));
  }
</style>
