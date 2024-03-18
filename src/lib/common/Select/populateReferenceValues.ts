import { notEmpty, query } from '$utils';
import mongoose from 'mongoose';
import { z } from 'zod';

type UnpopulatedValue = { _id: string; label?: string };
type PopulatedValue = { _id: string; label: string; [key: string]: unknown };

async function populateReferenceValues(
  values: UnpopulatedValue[],
  collectionUid: string,
  mainField?: string,
  requiredFieldNames?: string[],
  token?: string
): Promise<PopulatedValue[]> {
  return await Promise.all(
    values.map(async (value): Promise<PopulatedValue> => {
      const valueKeys = Object.keys(value);
      const forcedKeys = ['_id', mainField || 'label', ...(requiredFieldNames || [])];
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
            token
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
  token?: string
): Promise<Record<string, unknown> & { label: string }> {
  try {
    if (!mongoose.Types.ObjectId.isValid(_id)) return { label: _id };

    const fields = [...(requiredFieldNames || []), 'id', mainField].filter(notEmpty);
    const res = await query<Record<string, any>>({
      fetch,
      query: {
        location: '/admin/strapi/content-manager/collection-types/' + collectionUid + '/' + _id,
        opName: 'getReferencOptionsLabelsAndForcedFields',
        docsPath: '',
      },
      // variables: { fields },
      Authorization: `Bearer ${token}`,
      validator: z.any(),
      useCache: false,
    }).then((res) => {
      return res?.data?.docs;
    });

    return {
      ...res,
      label: res?.[mainField || 'id'] || _id,
    };
  } catch (error) {
    console.error(error);
    return { label: _id };
  }
}

export { populateReferenceValues };
