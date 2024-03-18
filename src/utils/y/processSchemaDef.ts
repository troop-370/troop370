import type { DeconstructedSchemaDefType } from './deconstructSchema';

export const processSchemaDef = ((args: {
  schemaDef: DeconstructedSchemaDefType;
  collapsed?: boolean;
  isPublishModal?: boolean;
  showHidden?: boolean;
}): DeconstructedSchemaDefType => {
  const { schemaDef, ...opts } = args;

  return (
    schemaDef
      .map(([key, def]) => {
        const labelDef = def.docs?.find(([ckey]) => ckey.replace(key + '.', '') === '#label')?.[1];
        return [key, def, labelDef] as [string, typeof def, typeof labelDef];
      })
      // sort fields to match their order
      .sort((a, b) => {
        const orderA = parseInt(`${a[1].field?.order || 1000}`);
        const orderB = parseInt(`${b[1].field?.order || 1000}`);
        return orderA > orderB ? 1 : -1;
      })
      // hide hidden fields
      .filter(([, def, labelDef]) => {
        if (opts.showHidden) return true;
        if (opts.isPublishModal) return def.field?.hidden === 'publish-only';
        if (labelDef)
          return labelDef.field?.hidden !== true && def.field?.hidden !== 'publish-only';
        return def.field?.hidden !== true && def.field?.hidden !== 'publish-only';
      })
      // remove fields that are used in the sidebar
      .filter(([key]) => {
        if (key === 'stage') return false;
        if (key === 'permissions.users') return false;
        if (key === 'permissions.teams') return false;
        return true;
      })
      // remove timestamps related to publishing
      .filter(([key]) => {
        return key !== 'timestamps.published_at' && key !== 'timestamps.updated_at';
      })
      .filter(([key, def, labelDef]) => {
        if (opts.collapsed === true)
          return def.field?.collapsed === true || labelDef?.field?.collapsed === true;
        if (opts.collapsed === false)
          return def.field?.collapsed !== true && labelDef?.field?.collapsed !== true;
        return true;
      })
      .map(([key, def, labelDef]) => {
        if (labelDef && labelDef.field) {
          return [key, { ...def, field: { ...(def.field || {}), ...labelDef.field } }] as [
            string,
            typeof def
          ];
        }
        return [key, def] as [string, typeof def];
      })
  );
}) satisfies ProcessSchemaDef;

export type ProcessSchemaDef = (args: {
  schemaDef: DeconstructedSchemaDefType;
  collapsed?: boolean;
  isPublishModal?: boolean;
  showHidden?: boolean;
}) => DeconstructedSchemaDefType;
