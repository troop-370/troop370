import { isJSON } from '$utils/isJSON';
import { get as getProperty, has as hasProperty, set as setProperty } from 'object-path';
import type * as Y from 'yjs';
import { ZodError, z } from 'zod';
import { deconstructSchema, type DeconstructedSchemaDefType } from './deconstructSchema';
import { isTypeTuple, type MongooseSchemaType } from './genSchema';
import shared from './shared';

interface AddToYParams {
  ydoc: Y.Doc;
  schemaDef: DeconstructedSchemaDefType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputData: any;
  /**
   * Only set the values of keys that are explicitly provided
   * to this function in `inputData`.
   */
  onlyProvided?: boolean;
  /**
   * Enable reference update mode, where only references are
   * modified, and they are only modified if they are outdated.
   */
  updateReferencesMode?: boolean;
}

async function addToY(params: AddToYParams) {
  const data = JSON.parse(JSON.stringify(params.inputData || {}));

  const JSONFields = params.schemaDef.filter(([, def]) => def.type === 'JSON');

  JSONFields.forEach(([key, def]) => {
    // find the set of fields that are meant for this specific document
    // by finding a matching name or name === 'default'
    const match =
      def.field?.custom?.find(({ name }) => name === params.inputData['name']) || // TODO: support any name field
      def.field?.custom?.find(({ name }) => name === 'default');

    // push the matching subfields onto the schemaDef variable
    // so that they can have a shared type created
    if (match) {
      const defs = deconstructSchema(match.fields, key);
      params.schemaDef.push(...defs);
    }

    // push the data to the key so it available when creating the shared type
    if (!def.field?.custom) {
      const value = getProperty(data, key);
      // JSON fields store their data as strignified JSON
      if (value && isJSON(value)) data[key] = JSON.parse(value);
    } else {
      // if this is a custom/branching set of fields, it is not stringified
      data[key] = getProperty(data, key);
    }
  });

  await Promise.all(
    params.schemaDef.map(async ([key, def]) => {
      if (!params.ydoc) return;
      if (params.onlyProvided && !hasProperty(data, key)) return;

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

      try {
        if (schemaType === 'ObjectId' || def.field?.reference?.collection) {
          // const validator = z.union([
          //   z.string().optional().nullable().array().optional().nullable(),
          //   z.object({ _id: z.string(), name: z.string().optional() }).passthrough().array(),
          // ]);
          // const validValue = validator.parse(isArray ? getProperty(data, key) : [getProperty(data, key)]);

          // const reference = new shared.Reference(params.ydoc);

          // await reference.set(
          //   key,
          //   validValue,
          //   params.TenantModel,
          //   {
          //     ...def.field?.reference,
          //     collection: def.field?.reference?.collection || def.type[0].replace('[', '').replace(']', ''),
          //   },
          //   params.updateReferencesMode
          // );

          return;
        }

        if (params.updateReferencesMode) return;

        if (schemaType === 'DocArray') {
          const validator = z.record(z.any()).array();
          const validValue = validator.parse(getProperty(data, key) || []);

          const array = new shared.DocArray(params.ydoc);
          const [, generatedUuids] = array.set(key, validValue);

          // insert values into the fields of each doc
          // by running each field through this function
          // after injecting the field data into the
          // data object with the correct key
          if (def.docs) {
            generatedUuids.forEach((uuid, index) => {
              if (def.docs) {
                const namedSubdocSchemas = def.docs
                  .filter(([docKey]) => !docKey.includes('#'))
                  .map(([docKey, docDef]): (typeof def.docs)[0] => {
                    const valueKey = docKey.replace(key, `${key}.${index}`);
                    const docArrayKey = docKey.replace(key, `__docArray.‾‾${key}‾‾.${uuid}`);

                    const value = getProperty(data, valueKey);
                    setProperty(data, docArrayKey, value);

                    return [docArrayKey, docDef];
                  });
                addToY({
                  ydoc: params.ydoc,
                  schemaDef: namedSubdocSchemas,
                  inputData: data,
                });
              }
            });
          }
          return;
        }

        if (schemaType === 'Boolean') {
          // arrays of booleans are not supported in the app
          if (isArray) return;

          const validator = z.boolean().optional().nullable();
          const validValue = validator.parse(getProperty(data, key));

          const boolean = new shared.Boolean(params.ydoc);
          boolean.set(key, validValue);
          return;
        }

        if (schemaType === 'Date') {
          // arrays of dates are not supported in the app
          if (isArray) return;

          const validator = z.string().optional().nullable();
          const validValue = validator.parse(getProperty(data, key));

          const date = new shared.Date(params.ydoc);
          date.set(key, validValue);
          return;
        }

        if (schemaType === 'Float') {
          const float = new shared.Float(params.ydoc);
          const validator = z.union([
            z.number().optional().nullable().array(),
            z.number().optional().nullable(),
          ]);
          const validValue = validator.parse(getProperty(data, key));

          if (isArray || options) {
            // if it is not an array, but there are options, stick
            // the value in an array since the SelectOne field
            // requires the value to be in an array
            float.set(key, Array.isArray(validValue) ? validValue : [validValue], options);
          } else {
            float.set(key, Array.isArray(validValue) ? validValue[0] : validValue);
          }

          return;
        }

        if (schemaType === 'JSON') {
          // Nothing should reach here
          // because JSON fields are converted
          // to the fields they actualy represent.
          // If a value reaches here, do nothing.
          // The UI will show it as uneditable JSON.
          return;
        }

        if (schemaType === 'Number') {
          const integer = new shared.Integer(params.ydoc);
          const validator = z.union([
            z.number().optional().nullable().array(),
            z.number().optional().nullable(),
          ]);
          const validValue = validator.parse(getProperty(data, key));

          if (isArray || options) {
            // if it is not an array, but there are options, stick
            // the value in an array since the SelectOne field
            // requires the value to be in an array
            integer.set(key, Array.isArray(validValue) ? validValue : [validValue], options);
          } else {
            integer.set(key, Array.isArray(validValue) ? validValue[0] : validValue);
          }

          return;
        }

        if (schemaType === 'String') {
          const string = new shared.String(params.ydoc);
          const validator = z.union([
            z.string().optional().nullable().array(),
            z.string().optional().nullable(),
          ]);
          const validValue = validator.parse(getProperty(data, key));

          if (isArray || options || reference?.collection) {
            // if it is not an array, but there are options (or a reference config), stick
            // the value in an array since the SelectOne and ReferenceOne fields
            // require the value to be in an array
            string.set(key, Array.isArray(validValue) ? validValue : [validValue], options);
          } else if (def.field?.markdown) {
            string.set(key, Array.isArray(validValue) ? validValue[0] : validValue, 'code');
          } else if (def.field?.tiptap) {
            string.set(key, Array.isArray(validValue) ? validValue[0] : validValue, 'tiptap');
          } else {
            string.set(key, Array.isArray(validValue) ? validValue[0] : validValue);
          }

          return;
        }
      } catch (error) {
        console.error(error);
        if (error instanceof ZodError) {
          throw new Error(
            `Validation error on field "${key}" of type "${schemaType}${
              isArray ? ' (Array)' : ''
            }" when adding value to document:\n${JSON.stringify(error.issues)}`
          );
        }
      }
    })
  );

  const unsaved = params.ydoc?.getArray('__unsavedFields');
  unsaved?.delete(0, unsaved.length);
}

export { addToY };
