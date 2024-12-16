import { Extension } from '@tiptap/core';
import type { AdditionOptions } from './';
import { Addition, AdditionEventHandler } from './';

interface AdditionKitOptions extends Partial<AdditionOptions> {}

const AdditionKit = Extension.create<AdditionKitOptions>({
  name: 'additionKit',

  addExtensions() {
    return [Addition, AdditionEventHandler];
  },
});

export { AdditionKit };
export type { AdditionKitOptions };
