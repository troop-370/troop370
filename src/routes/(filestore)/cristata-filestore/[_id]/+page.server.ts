import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import files from './files.json';

export const load = (({ params }) => {
  if (params._id.length !== 24) throw error(400, 'File IDs must be 24 characters.');

  const match = files.find((file) => file._id === params._id);
  if (!match) throw error(404, 'The specified file does not exist.');

  throw redirect(307, `https://troop-370-cristata-files.s3.us-east-1.amazonaws.com/${match.uuid}`);

  return {};
}) satisfies PageServerLoad;
