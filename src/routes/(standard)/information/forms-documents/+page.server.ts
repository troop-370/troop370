import { apity } from '$api';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const getFormsDocsPageConfig = apity.path('/forms-and-documents-page').method('get').create();

export const load: PageServerLoad = async () => {
  const { result } = getFormsDocsPageConfig({ populate: 'file_group.documents' }, fetch);
  const resolved = await result;
  if (!resolved.ok) error(resolved.status, 'server error');
  if (!resolved.data.data) error(404, 'not found');

  const fileGroups = resolved.data.data?.file_group;
  if (!fileGroups) error(404, 'file groups not found');

  return { fileGroups };
};
