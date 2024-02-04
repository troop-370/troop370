import { apity } from '$api';
import { notEmpty } from '$utils';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const getStandaloneEmails = apity.path('/standalone-emails').method('get').create();

export const load: PageServerLoad = async ({ params }) => {
  const { result } = getStandaloneEmails({ sort: 'shortPublishedAt:desc' }, fetch);
  const resolved = await result;
  if (!resolved.ok) throw error(resolved.status, 'server error');
  if (!resolved.data.data) throw error(404, 'not found');

  const docs = resolved.data.data
    .map((d) => d.attributes)
    .filter(notEmpty)
    .map((d) => {
      return {
        _id: d.object_id,
        name: d.name,
        timestamps: {
          published_at: d.publishedAt,
        },
      };
    });

  const pagination = resolved.data.meta?.pagination;
  const page = pagination?.page || parseInt(params.page);

  return {
    standaloneEmails: {
      docs,
      hasNextPage: (pagination?.pageCount || 1) > page,
      hasPrevPage: page > 1,
      page,
    },
  };
};
