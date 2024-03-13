import { Extension } from '@tiptap/core';

interface ClassNameOptions {
  types: string[];
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    className: {
      /**
       * Set the class of the element.
       */
      setClassName: (className: string) => ReturnType;
    };
  }
}

const ClassName = Extension.create<ClassNameOptions>({
  name: 'className',

  addOptions() {
    return {
      types: [],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          class: {
            default: null,
            // Customize the HTML parsing (for example, to load the initial content)
            parseHTML: (element) => element.getAttribute('class'),
            // … and customize the HTML rendering.
            renderHTML: (attributes) => {
              return {
                class: attributes.class,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setClassName:
        (className: string) =>
        ({ commands }) => {
          return this.options.types.every((type) => commands.updateAttributes(type, { class: className }));
        },
    };
  },
});

export { ClassName };
export type { ClassNameOptions };
