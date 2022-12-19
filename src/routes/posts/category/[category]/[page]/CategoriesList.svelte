<script lang="ts">
  import Ripple from '@smui/ripple';
</script>

<div class="categories">
  <h3>Categories</h3>
  <div class="catlist">
    <a use:Ripple={{ surface: true, color: 'primary' }} href="/posts">all categories</a>
    <a use:Ripple={{ surface: true, color: 'primary' }} href="/posts/category/advancement">
      advancement
    </a>
    <a use:Ripple={{ surface: true, color: 'primary' }} href="/posts/category/camping"> camping </a>
    <a use:Ripple={{ surface: true, color: 'primary' }} href="/posts/category/fundraiser">
      fundraiser
    </a>
    <a use:Ripple={{ surface: true, color: 'primary' }} href="/posts/category/high%20adventure">
      high adventure
    </a>
    <a use:Ripple={{ surface: true, color: 'primary' }} href="/posts/category/meeting"> meeting </a>
    <a use:Ripple={{ surface: true, color: 'primary' }} href="/posts/category/service"> service </a>
  </div>
</div>

<style>
  .catlist a {
    margin: 0 -20px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    height: 32px;
    text-transform: lowercase;
    font-family: var(--font-detail);
    font-weight: 500;
    color: var(--color-primary);
    text-decoration: none;
  }

  .categories {
    border: 1px solid rgba(0, 0, 0, 0.2);
    padding: 20px;
    margin: 10px 0;
    font-family: var(--font-detail);
    font-size: 1rem;
    line-height: 1.5rem;
    font-weight: 400;
    letter-spacing: 0.03125em;
  }

  h3 {
    font-family: var(--font-headline);
    font-size: 1.25rem;
    line-height: 2rem;
    font-weight: 500;
    letter-spacing: 0.0125em;
    text-decoration: inherit;
    text-transform: inherit;
    margin: 5px 0;
    line-height: 1.5;
  }

  @media (max-width: 1000px) {
    .categories {
      margin-bottom: 0;
    }

    .categories .catlist {
      display: inline-flex;
      column-gap: 6px;
      flex-wrap: wrap;
    }

    .categories .catlist a {
      padding: 0 10px;
      margin: 0 0 0 -10px;
    }
  }
</style>
