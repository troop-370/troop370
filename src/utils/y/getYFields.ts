import { get as getProperty, set as setProperty } from '$utils/objectPath';
import type * as Y from 'yjs';
import { deconstructSchema, type DeconstructedSchemaDefType } from './deconstructSchema';
import { isTypeTuple, type MongooseSchemaType } from './genSchema';
import shared from './shared';

interface GetYFieldsOptions {
  retainReferenceObjects?: boolean;
  keepJsonParsed?: boolean;
}

async function getYFields(
  ydoc: Y.Doc,
  _schemaDef: DeconstructedSchemaDefType,
  opts?: GetYFieldsOptions
) {
  const schemaDef = JSON.parse(JSON.stringify(_schemaDef)) as DeconstructedSchemaDefType;
  const data: any = {};

  const JSONFields = schemaDef.filter(([key, def]) => def.type === 'JSON');

  await Promise.all(
    schemaDef.map(async ([key, def]) => {
      if (!ydoc) return;

      const [schemaType, isArray] = (() => {
        const schemaType: MongooseSchemaType | 'DocArray' = isTypeTuple(def.type)
          ? def.type[1]
          : def.type;
        const isArrayType = Array.isArray(schemaType);

        if (isArrayType) return [schemaType[0], true];
        return [schemaType, false];
      })();

      const options = def.field?.options as unknown as
        | { value: string | number; label: string; disabled?: boolean }[]
        | undefined;

      const reference = def.field?.reference;

      if (schemaType === 'Boolean') {
        // arrays of booleans are not supported in the app
        if (isArray) return;

        const boolean = new shared.Boolean(ydoc);
        setProperty(data, key, boolean.get(key));
        return;
      }

      if (schemaType === 'Date') {
        // arrays of dates are not supported in the app
        if (isArray) return;

        const date = new shared.Date(ydoc);
        setProperty(data, key, date.get(key));
        return;
      }

      if (schemaType === 'DocArray') {
        const array = new shared.DocArray(ydoc);

        // construct the object with details on how to replace
        // the identifier in the schema to use a unique id for
        // subfields in yjs shared types
        const replace = (() => {
          const parentKey = key.match(/(?<=‾‾)(.*)(?=‾‾)/)?.[0];
          const parentUuid = key.match(
            /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/
          )?.[0];
          const accessKey = key
            .replace(`__docArray.‾‾${parentKey}‾‾.`, parentKey || '') // remove docarray string data
            .replace(parentUuid || '', ''); // remove parent uuid

          return {
            searchKey: accessKey,
            replaceKey: accessKey,
          };
        })();

        // get the value of the shared type as an array of objects
        let arrayValue: Record<string, unknown>[] = [];
        if (def.docs) {
          const namedSubdocSchemas = def.docs.filter(([docKey]) => !docKey.includes('#'));
          arrayValue = await array.get(
            key,
            { y: { ydoc }, opts, schema: namedSubdocSchemas },
            replace
          );
        } else {
          arrayValue = await array.get(key, undefined, replace);
        }

        // remove the uuid
        arrayValue = arrayValue.map(({ __uuid, ...rest }) => rest);

        // insert the value of this field into the data object that
        // is returned by this function
        setProperty(data, key, arrayValue);
        return;
      }

      if (schemaType === 'Float') {
        const float = new shared.Float(ydoc);
        if (isArray || options || reference) {
          const ids = float.get(key, true).map(({ value }) => value);
          setProperty(data, key, isArray ? ids : ids[0]);
          return;
        }
        setProperty(data, key, float.get(key, false));
        return;
      }

      if (schemaType === 'JSON') {
        // Nothing should reach here
        // because JSON fields are converted
        // to the fields they actualy represent.
        // If a value reaches here, do nothing.
        // The UI will show it as uneditable JSON.
      }

      if (schemaType === 'Number') {
        const integer = new shared.Integer(ydoc);
        if (isArray || options || reference) {
          const ids = integer.get(key, true).map(({ value }) => value);
          setProperty(data, key, isArray ? ids : ids[0]);
          return;
        }
        setProperty(data, key, integer.get(key, false));
        return;
      }

      if (schemaType === 'ObjectId' || key === 'permissions.teams') {
        const reference = new shared.Reference(ydoc);
        const values = reference.get(key);
        if (opts?.retainReferenceObjects) {
          setProperty(data, key, isArray ? values : values[0]);
          return;
        }
        const ids = values.map(({ value }) => value);
        setProperty(data, key, isArray ? ids : ids[0]);
        return;
      }

      if (schemaType === 'String') {
        const string = new shared.String(ydoc);
        if (isArray || options || reference) {
          const ids = (await string.get(key, true, false, false)).map(({ value }) => value);
          setProperty(data, key, isArray ? ids : ids[0]);
          return;
        }
        if (def.field?.markdown) {
          setProperty(data, key, await string.get(key, false, false, true));
          return;
        }
        setProperty(data, key, await string.get(key, false, !!def.field?.tiptap, false));
        return;
      }
    })
  );

  await Promise.all(
    JSONFields.map(async ([key, def]) => {
      // find the set of fields that are meant for this specific document
      // by finding a matching name or name === 'default'
      const match =
        def.field?.custom?.find(({ name }) => name === data['name']) || // TODO: support any name field
        def.field?.custom?.find(({ name }) => name === 'default');

      // push the matching subfields onto the schemaDef variable
      // so that they can have a shared type created
      if (match) {
        const defs = deconstructSchema(match.fields, key);
        const values = await getYFields(ydoc, defs, opts);
        defs.forEach(([subvalueKey]) => {
          // set the data for each key
          setProperty(data, subvalueKey, getProperty(values, subvalueKey));
        });
        setProperty(data, '__toJSON.' + key, true);
      }

      // stringify the JSON field values
      if (!opts?.keepJsonParsed && !match) {
        setProperty(data, key, JSON.stringify(getProperty(data, key)));
      }
    })
  );

  return data;
}

export { getYFields };
export type { GetYFieldsOptions };
