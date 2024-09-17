import { ECWID_SECRET_TOKEN, ECWID_STORE_ID } from '$env/static/private';
import { storeProfileSchema } from '$lib/schemas/ecwidSchemas';
import { fromError } from 'zod-validation-error';

export async function getStoreProfile() {
  return await fetch(`https://app.ecwid.com/api/v3/${ECWID_STORE_ID}/profile`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${ECWID_SECRET_TOKEN}`,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.errorMessage) {
        throw new Error(json.errorMessage);
      }
      return storeProfileSchema.parse(json);
    })
    .catch((error) => {
      const validationError = fromError(error);
      console.error('Failed to fetch store profile', validationError);
      throw validationError;
    });
}
