import { API_BEARER } from '$env/static/private';
import { PUBLIC_API_URL } from '$env/static/public';
import { Apity } from '@cocreators-ee/apity';
import type { paths } from './types';

const apity = Apity.for<paths>();

apity.configure({
  baseUrl: PUBLIC_API_URL,
  init: {
    headers: {
      Authorization: `Bearer ${API_BEARER}`,
      Accept: 'application/json',
    },
  },
});

export { apity };
