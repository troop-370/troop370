<script lang="ts">
  export let label = 'Preview data';
  export let caption: string = '';
  export let data: any;
</script>

<div>
  <h2>{label}</h2>
  {#if caption}
    <p>{caption}</p>
  {/if}
  <pre>{JSON.stringify(data || '', null, 2)}</pre>
</div>

<style>
  div {
    border: 1px solid lightgray;
    margin: 20px;
    padding: 20px;
    overflow-x: auto;
  }

  h2 {
    margin: 0;
    font-family: var(--font-headline);
    font-size: 1.25rem;
    font-weight: 500;
  }

  h2::before {
    content: '>';
    margin-right: 10px;
  }

  p {
    font-family: var(--font-detail);
    font-size: 0.9rem;
  }

  @media print {
    div {
      display: none;
    }
  }
</style>
