import { redirect, type Load } from '@sveltejs/kit';

export const load: Load = () => {
  throw redirect(307, '/posts/category/all');
};
