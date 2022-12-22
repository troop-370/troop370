import { redirect, type Load } from '@sveltejs/kit';

export const load: Load = ({ url }) => {
  throw redirect(307, url.pathname + '/1');
};
