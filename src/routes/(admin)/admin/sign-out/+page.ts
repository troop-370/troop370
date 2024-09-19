import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const ssr = false;

export const load = (async ({ fetch }) => {
  localStorage.removeItem('jwtToken');
  localStorage.removeItem('STRAPI_NPS_SURVEY_SETTINGS');
  localStorage.removeItem('userInfo');
  sessionStorage.removeItem('jwtToken');

  redirect(302, '/admin/login');
}) satisfies PageLoad;
