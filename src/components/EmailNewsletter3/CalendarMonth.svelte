<script lang="ts">
  import { Markdown } from '$utils';

  export let month: string;
  export let eventsMarkdown: string;

  const [, html] = Markdown.parse(eventsMarkdown);
</script>

<tr>
  <td width="25%" valign="top">{month}</td>
  <td width="75%" valign="top">{@html html}</td>
</tr>

<style>
  td {
    font-family: roboto, sans-serif;
    line-height: 1.2;
    font-weight: 400;
    letter-spacing: normal;
    color: #000000;
  }

  td:first-of-type {
    font-size: 16px;
    padding: 13px 10px 0 0;
  }

  td:last-of-type {
    font-size: 13px;
    padding: 5px 0 0 0;
  }
</style>
