import { notEmpty, query } from '$utils';
import { isError } from 'is-what';
import mongoose from 'mongoose';
import { z } from 'zod';

type UnpopulatedValue = { _id: string; label?: string };
type PopulatedValue = { _id: string; label: string; [key: string]: unknown };

const standardFields = ['id', 'documentId', 'publishedAt', 'updatedAt'];

async function populateReferenceValues(
  values: UnpopulatedValue[],
  collectionUid: string,
  mainField?: string,
  requiredFieldNames?: string[],
  token?: string,
  signal?: AbortSignal
): Promise<PopulatedValue[]> {
  return await Promise.all(
    values.map(async (value): Promise<PopulatedValue> => {
      const valueKeys = Object.keys(value);
      const forcedKeys = [
        '_id',
        ...standardFields,
        mainField || 'label',
        ...(requiredFieldNames || []),
      ];
      const hasEveryKey = forcedKeys.every((forcedKey) => valueKeys.includes(forcedKey));

      if (hasEveryKey) {
        return { ...value, label: `${value.label}` };
      } else {
        return {
          _id: value._id,
          ...(await getMissingLabelAndForcedFields(
            value._id,
            collectionUid,
            mainField,
            requiredFieldNames,
            token,
            signal
          )),
        };
      }
    })
  );
}

async function getMissingLabelAndForcedFields(
  _id: string,
  collectionUid: string,
  mainField?: string,
  requiredFieldNames?: string[],
  token?: string,
  signal?: AbortSignal
): Promise<Record<string, unknown> & { label: string }> {
  try {
    const fields = [...(requiredFieldNames || []), ...standardFields, mainField].filter(notEmpty);
    const res = await query<Record<string, any>>({
      fetch,
      signal,
      query: {
        location: '/strapi/content-manager/collection-types/' + collectionUid + '/' + _id,
        opName: 'getReferencOptionsLabelsAndForcedFields',
        docsPath: '',
      },
      variables: { fields },
      Authorization: `Bearer ${token}`,
      validator: z.any(),
      useCache: false,
    })
      .then((res) => {
        return res?.data?.docs?.data;
      })
      .then((docData) => {
        if (!docData && signal?.aborted) {
          throw new Error('Aborted');
        }
        return docData;
      })
      .then((docData) => {
        // only return the fields that were requested
        return fields.reduce((acc: Record<string, unknown>, field) => {
          acc[field] = docData[field];
          return acc;
        }, {});
      });

    return {
      ...res,
      label: res?.[mainField || 'id'] || _id,
    };
  } catch (error) {
    if (isError(error) && error.message === 'Aborted') {
      throw error;
    }
    console.error(error);
    return { label: _id };
  }
}

export { populateReferenceValues };
