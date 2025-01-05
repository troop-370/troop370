<script lang="ts">
  export let src: string;
  let hidden = false;
</script>

{#if hidden === false}
  <div class={'article-photo-container--paladin2020'}>
    <img
      {src}
      alt=""
      class="article-photo-image--paladin2020"
      on:error={() => (hidden = true)}
      onerror="this.parentElement.style.display = 'none'"
    />
  </div>
{/if}

<style>
  .article-photo-container--paladin2020 {
    width: 100%;
    padding-top: calc(66.6667%);
    height: 0px;
    position: relative;
    margin: 0 0 4px 0;
  }
  @media screen and (max-width: 600px) {
    .article-photo-container--paladin2020 {
      /* expand into page margins */
      width: calc(100% + 40px);
      left: -20px;
    }
  }
  .article-photo-image--paladin2020 {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0px;
    object-fit: cover;
  }
</style>
