export interface tiptapOptions {
  isHTMLkey?: string;
  layouts?: {
    key: string;
    options: { value: string; label: string }[];
  };
  /**
   * URL to be loaded in an iFrame that can receive document data and present it.
   *
   * This is helpful for previewing the header area of a document so it is
   * possible to see how it will appear once it is published to a website or app.
   *
   * Include the [iframe-resize](https://github.com/davidjbradshaw/iframe-resizer) content window script to allow the frame to
   * automaticallt resize to fit the frame contents.
   */
  metaFrame?: string;
  /**
   * Custom css that will be applied to the editor. It can include nested selectors.
   */
  css?: string;
  /**
   * Fields that should have their value stored as a data attribute
   * on the prosemirror div. The data attribute can be used for
   * providing specific css based on field values.
   *
   * Only fields that have a string or numeric value will be used
   * for data attributes. ObjectId fields will be stingified into their
   * hexadecimal representation.
   */
  pmAttrFields?: string[];
  features: {
    fontFamilies?: {
      name: string;
      label?: string;
      disabled?: boolean;
    }[];
    fontFamilyPicker?: boolean;
    fontSizes?: string[];
    fontSizePicker?: boolean;
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
      sweepwidget?: boolean;
      youtube?: boolean;
    };
    link?: boolean;
    comment?: boolean;
    trackChanges?: boolean;
    pullQuote?: boolean;
    tables?: boolean;
  };
}
