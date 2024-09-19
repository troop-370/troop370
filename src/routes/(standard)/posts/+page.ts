import { redirect, type Load } from '@sveltejs/kit';

export const load: Load = () => {
  redirect(307, '/posts/category/all');
};
