<script lang="ts">
  import Button, { Label } from '@smui/button';

  export let href: string;
</script>

<Button variant="outlined" class="mdc-button-outlined--on-primary" {href}>
  <Label><slot /></Label>
</Button>
