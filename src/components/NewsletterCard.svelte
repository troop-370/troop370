<script lang="ts">
  import { formatISODate } from '$utils';
  import Button, { Icon, Label } from '@smui/button';
  import { marked } from 'marked';

  export let name: string;
  export let href: string;
  export let date: string | undefined = undefined;
  export let buttonText = 'View';
</script>

<article>
  <div>
    <a {href}><h2>{@html marked.parseInline(name)}</h2> </a>
    <div class="meta">
      {#if date}
        <span>{formatISODate(date, false, true, false)}</span>
      {/if}
    </div>
  </div>
  <Button variant="outlined" {href}>
    <Label>{buttonText}</Label>
    <Icon class="material-icons">arrow_forward</Icon>
  </Button>
</article>

<style>
  article {
    border: 1px solid rgba(0, 0, 0, 0.2);
    padding: 20px;
    margin: 10px 0;
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  article :global(.post-card--lock-icon) {
    position: absolute;
    top: 20px;
    right: 20px;
    color: var(--color-neutral-160);
    font-size: 20px;
    user-select: none;
    cursor: help;
  }

  h2 {
    font-family: var(--font-headline);
    font-weight: 500;
    letter-spacing: normal;
    text-decoration: inherit;
    text-transform: inherit;
    font-size: 28px;
    display: inline-block;
    line-height: 1.2;
    margin: 5px 0 0 0;
  }

  div.meta {
    font-family: var(--font-headline);
    font-weight: 500;
    font-size: 18px;
    font-style: italic;
    letter-spacing: normal;
    margin-top: 0px;
    opacity: 0.9;
    margin: 2px 0 15px 0;
  }

  a {
    color: inherit;
    transition:
      background-color 0.2s,
      box-shadow 0.1s,
      color 0.2s;
    text-decoration: none;
  }
  a:hover {
    box-shadow: 0 2px 0 0 var(--color-primary);
    background-color: hsla(var(--color-primary-hsl), 0.1);
    color: var(--color-primary);
  }
  a:active {
    background-color: hsla(var(--color-primary-hsl), 0.16);
  }
  a:focus-visible {
    box-shadow: 0 0 0 2px var(--color-primary);
  }
</style>
