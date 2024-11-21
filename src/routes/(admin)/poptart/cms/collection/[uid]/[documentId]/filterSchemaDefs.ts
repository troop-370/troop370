import { copy } from 'copy-anything';
import { isArray } from 'is-what';
import type { SchemaDef } from '../+layout';
import type { PageData } from './$types';
import { deconstructSchemaDefs } from './getDocument';

type Permissions = PageData['permissions'];

export function filterSchemaDefs(
  schemaDefs: SchemaDef[],
  permissions: Permissions,
  filterModes: ('read' | 'update' | 'create')[]
) {
  const defs = copy(schemaDefs);
  const deconstructedSchemaDefs = deconstructSchemaDefs(defs);

  if (filterModes.includes('read')) {
    const readableFields = permissions.find(
      (p) => p.action === 'plugin::content-manager.explorer.read'
    )?.properties?.fields;
    deconstructedSchemaDefs.forEach(([field, def]) => {
      if (isArray(readableFields)) {
        const fieldIsNotReadable = !readableFields.includes(field);
        if (fieldIsNotReadable) def.noread = true;
      }
    });
  }

  if (filterModes.includes('update')) {
    const writableFields = permissions.find(
      (p) => p.action === 'plugin::content-manager.explorer.update'
    )?.properties?.fields;
    deconstructedSchemaDefs.forEach(([field, def]) => {
      if (isArray(writableFields)) {
        const fieldIsReadOnly = !writableFields.includes(field);
        if (fieldIsReadOnly) def.readonly = true;
      }
    });
  }

  if (filterModes.includes('create')) {
    const createableFields = permissions.find(
      (p) => p.action === 'plugin::content-manager.explorer.create'
    )?.properties?.fields;
    deconstructedSchemaDefs.forEach(([field, def]) => {
      if (isArray(createableFields)) {
        const fieldIsReadOnly = !createableFields.includes(field);
        if (fieldIsReadOnly) def.readonly = true;
      }
    });
  }

  return defs;
}
