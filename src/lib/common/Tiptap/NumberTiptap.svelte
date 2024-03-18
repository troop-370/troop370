<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import Tiptap from './Tiptap.svelte';
  import { editorExtensions } from './editorExtensions';

  export let ydoc: ComponentProps<Tiptap>['ydoc'];
  export let ydocKey: ComponentProps<Tiptap>['ydocKey'];
  export let wsProvider: ComponentProps<Tiptap>['wsProvider'];
  export let disabled: ComponentProps<Tiptap>['disabled'];
  export let user: ComponentProps<Tiptap>['user'];
  export let allowDecimals = false;
</script>

<Tiptap
  {disabled}
  {ydoc}
  {ydocKey}
  {wsProvider}
  {user}
  extensions={editorExtensions[allowDecimals ? 'float' : 'integer']}
/>
