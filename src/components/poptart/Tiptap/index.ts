export { default as NumberTiptap } from './NumberTiptap.svelte';
export { default as RichTiptap } from './RichTiptap.svelte';
export { default as TextTiptap } from './TextTiptap.svelte';

export interface tiptapOptions {
  css?: string;
  metaFrame?: string;
  features: {
    fontFamilies?: {
      name: string;
      label?: string;
      disabled?: boolean;
    }[];
    fontSizes?: string[];
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    code?: boolean;
    bulletList?: boolean;
    orderedList?: boolean;
    textStylePicker?: boolean;
    horizontalRule?: boolean;
    widgets?: {
      photoWidget?: boolean;
      youtube?: boolean;
    };
    link?: boolean;
    comment?: boolean;
    trackChanges?: boolean;
    pullQuote?: boolean;
  };
}
