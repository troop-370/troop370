import { redirect, type Load } from '@sveltejs/kit';

export const load: Load = ({ url }) => {
  redirect(307, url.pathname + '/standalone/browse');
};
