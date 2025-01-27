<script lang="ts">
  import { notEmpty } from '$utils';
  import { z } from 'zod';
  import type { validator } from './validator';

  export let data: z.infer<typeof validator>;
</script>

{#if !data.submitted_by || data.submitted_by.filter(notEmpty).length === 0}
  <div class="warning">
    WARNING! You have not specified the first and last name of the person who submitted this post.
    Please add them via the <span style="font-weight: 500;">Submitted by</span> field.
  </div>
{/if}
{#if data.submitted_by && data.submitted_by.filter(notEmpty).length && data.submitted_by.some((name) => !name
        .trim()
        .includes(' '))}
  <div class="warning light">
    You have not specified the first and last name of the person who submitted this post. Please
    specify their full first and last name them via the <span style="font-weight: 500;"
      >Submitted by</span
    > field.
  </div>
{/if}
{#if !data.category || data.category.filter(notEmpty).length === 0}
  <div class="warning">
    WARNING! You have not specified a category for this post. Please add one via the
    <span style="font-weight: 500;">Category</span> field.
  </div>
{/if}
{#if !data.enable_password_protection && data.body.match(/[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/)}
  <div class="warning light">
    It looks like you have included an email address in the body of this post. If it is a personal
    email address, consider enabling the
    <span style="font-weight: 500;">Enable password protection</span>
    option to prevent this email from being visible to the public and bots.
  </div>
{/if}
{#if !data.enable_password_protection && data.body.match(/(\+?\d{1,2}\s?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)}
  <div class="warning light">
    It looks like you have included a phone number in the body of this post. If it is a personal
    phone number, consider enabling the
    <span style="font-weight: 500;">Enable password protection</span>
    option to prevent this phone number from being visible to the public and bots.
  </div>
{/if}

<style>
  div.warning {
    background-color: var(--color-secondary);
    grid-column-start: 1;
    grid-column-end: 4;
    margin: 0 0 0 -10px;
    width: calc(100% + 30px);
    padding: 4px 20px;
    box-sizing: border-box;
    font-family: var(--font-detail);
    color: var(--color-neutral-10);
  }

  div.warning.light {
    background-color: color-mix(in srgb, black 20%, var(--color-primary) 100%);
  }
</style>
