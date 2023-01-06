<script lang="ts">
  import { marked } from 'marked';
  import { ContainerTable, Number } from '.';

  export let name: string;
  export let description: string;
  export let buttonText: string;
  export let slug: string | null | undefined;
  export let number: number;
  export let category: string;
</script>

<ContainerTable>
  <tr>
    <td>
      <h2>
        <Number {number} {category} />
        <span>{@html marked.parseInline(name)}</span>
      </h2>
      <p>{@html marked.parseInline(description)}</p>
    </td>
    <td class="button-td" width={124}>
      <a href="https://troop370atlanta.org/posts/{slug}">{buttonText}</a>
    </td>
  </tr>
</ContainerTable>

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

  p {
    font-family: roboto, sans-serif;
    font-size: 12.5px;
    line-height: 1.35;
    font-weight: 400;
    letter-spacing: normal;
    margin: 0 0 8px 0;
    opacity: 0.9;
    color: #000000;
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

  span {
    vertical-align: middle;
  }

  .button-td {
    text-align: right;
    vertical-align: middle;
    padding: 0;
  }
</style>
