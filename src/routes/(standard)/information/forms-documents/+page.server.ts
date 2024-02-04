import { apity } from '$api';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const getFormsDocsPageConfig = apity.path('/forms-and-documents-page').method('get').create();

export const load: PageServerLoad = async ({ params, url }) => {
  const { result } = getFormsDocsPageConfig(
    { populate: 'file_group, file_group.documents' },
    fetch
  );
  const resolved = await result;
  if (!resolved.ok) throw error(resolved.status, 'server error');
  if (!resolved.data.data) throw error(404, 'not found');

  const fileGroups = resolved.data.data.attributes?.file_group;
  if (!fileGroups) throw error(404, 'file groups not found');

  console.log(fileGroups);

  return { fileGroups };
};
