<script lang="ts">
  import { capitalize, notEmpty } from '$utils';
  import { marked } from 'marked';
  import { ContainerTable, Number } from '.';

  export let label: string;
  export let posts: {
    name: string;
    description: string;
    button_text: string;
    slug: string | null | undefined;
    categories: (string | null)[];
  }[];
  export let numberStart: number;
</script>

{#if posts.filter(notEmpty).length > 0}
  <tr>
    <td>
      <ContainerTable>
        <tr>
          <td>
            <h2>
              <Number number={numberStart} category="" />
              <span>{@html marked.parseInline(capitalize(label))}</span>
            </h2>
          </td>
        </tr>
        {#each posts as post, index}
          <tr>
            <td>
              <h3>{@html marked.parseInline(post.name)}</h3>
              <p class:last={index === posts.length - 1}>
                {@html marked.parseInline(post.description)}
              </p>
            </td>
            <td class="button-td" width={124}>
              <a href="https://troop370atlanta.org/posts/{post.slug}">{post.button_text}</a>
            </td>
          </tr>
        {/each}
      </ContainerTable>
    </td>
  </tr>
{/if}

<style>
  h2 {
    font-family: roboto, sans-serif;
    font-size: 18px;
    line-height: 1.2;
    font-weight: 500;
    letter-spacing: normal;
    margin: 24px 0 2px 0;
    color: rgb(0, 0, 0) !important;
  }

  span {
    vertical-align: middle;
  }

  h3 {
    font-family: roboto, sans-serif;
    font-size: 14.5px;
    line-height: 1.2;
    font-weight: 500;
    letter-spacing: normal;
    margin: 10px 0 2px 0;
    color: rgb(0, 0, 0) !important;
  }

  p {
    font-family: roboto, sans-serif;
    font-size: 12.5px;
    line-height: 1.35;
    font-weight: 400;
    letter-spacing: normal;
    margin: 2px 0 0 0;
    opacity: 0.9;
    color: #000000;
  }

  p.last {
    margin-bottom: 8px;
  }

  a {
    font-family: roboto, sans-serif;
    font-size: 12.5px;
    font-weight: 700;
    line-height: 18px;
    letter-spacing: 1.15px;
    text-decoration: none;
    text-transform: uppercase;
    padding: 6px 8px;
    border: 1px solid #cccccc;
    color: rgb(0, 63, 135);
    border-radius: 2px;
  }

  .button-td {
    text-align: right;
    vertical-align: middle;
    padding: 0;
  }
</style>
