<script lang="ts">
  import type { ApiTypes } from '$api';
  import { notEmpty } from '$utils';
  import { marked } from 'marked';
  import { CardTable, ContainerTable } from '.';

  export let label: string;
  export let posts: NonNullable<
    NonNullable<ApiTypes['manualSchemas']['Newsletter']['version2']>['fundraiser_mini_posts']
  >;

  $: _posts = (posts || []).filter(notEmpty);
</script>

{#if _posts.length > 0}
  <tr>
    <td>
      <CardTable>
        <tr>
          <td>
            <ContainerTable>
              <tr>
                <td>
                  <h2>{label}</h2>
                </td>
              </tr>
              {#each _posts as post}
                <tr>
                  <td>
                    <h3>{@html marked.parseInline(post.title || '')}</h3>
                    <p>{@html marked.parseInline(post.subtitle || '')}</p>
                  </td>
                  {#if post.slug}
                    <td class="button-td" width={124}>
                      <a href="https://troop370atlanta.org/posts/{post.slug}">{post.button_text}</a>
                    </td>
                  {/if}
                </tr>
              {/each}
            </ContainerTable>
          </td>
        </tr>
      </CardTable>
    </td>
  </tr>
{/if}

<style>
  h2 {
    font-family: roboto, sans-serif;
    font-size: 16px;
    line-height: 1.2;
    font-weight: 500;
    letter-spacing: normal;
    margin: 5px 0;
    text-transform: uppercase;
    color: rgb(0, 0, 0) !important;
  }

  h3 {
    font-family: roboto, sans-serif;
    font-size: 14.5px;
    line-height: 1.2;
    font-weight: 500;
    letter-spacing: normal;
    margin: 5px 0;
    color: rgb(0, 0, 0) !important;
  }

  p {
    font-family: roboto, sans-serif;
    font-size: 12.5px;
    line-height: 1.35;
    font-weight: 400;
    letter-spacing: normal;
    margin: 2px 0 10px 0;
    opacity: 0.9;
    color: #000000;
  }

  a {
    font-family: roboto, sans-serif;
    font-size: 13px;
    font-weight: 700;
    line-height: 18px;
    letter-spacing: 0.0892857em;
    text-decoration: none;
    text-transform: uppercase;
    padding: 6px 8px;
    border: 1px solid rgb(128, 128, 128);
    color: rgb(0, 63, 135);
  }

  .button-td {
    text-align: right;
    vertical-align: middle;
    padding: 0;
  }
</style>
