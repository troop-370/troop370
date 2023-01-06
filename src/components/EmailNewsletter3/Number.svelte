<script lang="ts">
  export let number: number;
  export let category: string;

  const color = (() => {
    if (category === 'advancement') return '#6920bc';
    if (category === 'camping') return '#1f6b20';
    if (category === 'high adventure') return '#1f6b20';
    if (category === 'fundraiser') return '#aa1a93'; //
    if (category === 'service') return '#7c4608';
    if (category === 'meeting') return '#bc1b2d';
    return '#003f87';
  })();
</script>

{@html `
  <!-- [if mso]
    <v:roundrect
      xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      style="height:20px;v-text-anchor:middle;width:20px;vertical-align:middle;margin-right:4px;"
      arcsize="100%"
      strokecolor="#003f87"
      fillcolor="${color}"
    >
      <w:anchorlock />
      <center style="color:#e0e0e0;font-family:sans-serif;font-size:12.5px;font-weight:bold;"
        >${number}</center
      >
    </v:roundrect>
  ![endif] -->
`}

{@html '<!--[if !mso]><!-->'}
<span style="mso-hide: all; background-color: {color};">{number}</span>
{@html '<!--<![endif]-->'}

<style>
  span {
    border-radius: 20px;
    color: #f0f0f0;
    display: inline-block;
    font-family: roboto, sans-serif;
    font-size: 12.5px;
    font-weight: bold;
    line-height: 20px;
    width: 20px;
    height: 20px;
    text-align: center;
    vertical-align: middle;
    text-decoration: none;
    -webkit-text-size-adjust: none;
    margin-right: 4px;
  }
</style>
