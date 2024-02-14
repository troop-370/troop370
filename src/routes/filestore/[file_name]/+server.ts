import { apity } from '$api';
import { AWS_ACCESS_KEY_ID, AWS_ACCESS_SECRET, AWS_BUCKET, AWS_REGION } from '$env/static/private';
import { PUBLIC_NEW_FILESTORE_PATH, PUBLIC_OLD_FILESTORE_PATH } from '$env/static/public';
import { notEmpty } from '$utils';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { RequestHandler } from './$types';

const getFiles = apity.path('/upload/files').method('get').create();
const getEventsPageConfig = apity.path('/events-page').method('get').create();
const getHomePageConfig = apity.path('/home-page').method('get').create();

export const GET: RequestHandler = async ({ params, locals, url }) => {
  const fileName = params.file_name;
  const fileHash = params.file_name.split('.').slice(0, -1).join('.');
  const fileUrl = `https://${AWS_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${fileName}?${url.searchParams}`;

  // attempt to get the file from the s3 bucket
  const response = await fetch(fileUrl);

  // the file exists and the signed URL is valid, so we can send the file body
  if (response.status === 200) {
    const body = await response.blob();
    return new Response(body, {
      status: 200,
      headers: { 'Content-Disposition': `inline; filename="${fileName}"` },
    });
  }

  // if AWS gives a forbidden error, then either the signed URL has expired
  // or the file does not exist
  if (response.status === 403) {
    // skip auth for photos used as backgrounds on select pages
    const eventPhotoNames = getEventsPagePhotoNames();
    const announcmenetPhotoNames = getHomePagePhotoNames();
    const skipAuth =
      (await eventPhotoNames).includes(fileName) ||
      (await announcmenetPhotoNames).includes(fileName);

    console.log(announcmenetPhotoNames);

    // require authentication to refresh the signed URL
    if (skipAuth !== true && locals.session.data.authenticated !== true) {
      return Response.redirect(
        `${url.origin}/basic-login?from=${encodeURIComponent(url.href)}`,
        302
      );
    }

    // check if the file exists
    const { result } = getFiles({ filters: { hash: fileHash } }, fetch);
    const resolved = await result;
    if (resolved.ok && resolved.data.length > 0) {
      // if the file exists, then we need to create a presigned URL
      // to get the file (the getFiles endpoint does not return
      // URLS thats are presigned)
      const client = new S3Client({
        region: AWS_REGION,
        credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_ACCESS_SECRET },
      });
      const command = new GetObjectCommand({ Bucket: AWS_BUCKET, Key: fileName });
      const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });

      // once we have the signed URL, we need to get the file
      const response = await fetch(signedUrl);
      if (response.status === 200) {
        const body = await response.blob();
        const niceFileName = `${resolved.data[0].name}`;
        return new Response(body, {
          status: 200,
          headers: { 'Content-Disposition': `inline; filename="${niceFileName || fileName}"` },
        });
      }
    }
  }

  return new Response(null, { status: 403 });
};

async function getEventsPagePhotoNames() {
  const { result } = getEventsPageConfig({ populate: 'nav_items.photo' }, fetch);
  const resolved = await result;
  if (!resolved.ok) return [];
  if (!resolved.data.data) return [];

  const cards = resolved.data.data.attributes?.nav_items;
  if (!cards) return [];

  const photoNames = cards
    .map((card) => card.photo?.data?.attributes?.url)
    .filter(notEmpty)
    .map((url) =>
      url.replace(PUBLIC_OLD_FILESTORE_PATH + '/', '').replace(PUBLIC_NEW_FILESTORE_PATH + '/', '')
    );
  return photoNames;
}

async function getHomePagePhotoNames() {
  const { result } = getHomePageConfig({ populate: 'announcement_cards.background_photo' }, fetch);
  const resolved = await result;
  if (!resolved.ok) return [];
  if (!resolved.data.data) return [];

  const cards = resolved.data.data.attributes?.announcement_cards;
  if (!cards) return [];

  const photoNames = cards
    .map((card) => card.background_photo?.data?.attributes?.url)
    .filter(notEmpty)
    .map((url) =>
      url.replace(PUBLIC_OLD_FILESTORE_PATH + '/', '').replace(PUBLIC_NEW_FILESTORE_PATH + '/', '')
    );
  return photoNames;
}
