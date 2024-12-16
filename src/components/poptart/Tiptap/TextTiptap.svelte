<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import Tiptap from './Tiptap.svelte';
  import { editorExtensions } from './editorExtensions';
  import type { tiptapOptions } from './tiptapOptions';

  export let ydoc: ComponentProps<Tiptap>['ydoc'];
  export let ydocKey: ComponentProps<Tiptap>['ydocKey'];
  export let disabled: ComponentProps<Tiptap>['disabled'];
  export let user: ComponentProps<Tiptap>['user'];
  export let options: tiptapOptions | undefined = undefined;
</script>

<Tiptap {disabled} {ydoc} {ydocKey} {user} {options} extensions={editorExtensions.text} />
