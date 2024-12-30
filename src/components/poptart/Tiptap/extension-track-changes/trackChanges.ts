import { Extension } from '@tiptap/core';
import { AdditionKit } from '../extension-addition';
import { DeletionKit } from '../extension-deletion';
import { ManageChanges } from '../extension-manage-changes';

interface TrackChangesOptions {}

const TrackChanges = Extension.create<TrackChangesOptions>({
  name: 'trackChanges',

  addExtensions() {
    return [DeletionKit, AdditionKit, ManageChanges];
  },
});

export { TrackChanges };
export type { TrackChangesOptions };
