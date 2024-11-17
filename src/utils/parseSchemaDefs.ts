import type { SchemaDef } from '../routes/(admin)/poptart/cms/collection/[uid]/+layout';

const systemFields = ['id', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy'];

export function parseSchemaDefs(schemaDefs: SchemaDef[]) {
  const visibleFieldDefs = schemaDefs.filter(
    ([key, def]) =>
      def.order < Infinity &&
      !systemFields.includes(key) &&
      !systemFields.includes(getComponentKey(key))
  );
  const hiddenFieldDefs = schemaDefs.filter(
    ([key, def]) =>
      def.order === Infinity &&
      !systemFields.includes(key) &&
      !systemFields.includes(getComponentKey(key))
  );
  return { visibleFieldDefs, hiddenFieldDefs };
}

function getComponentKey(key: string) {
  return key.split('.').slice(-1)[0];
}
