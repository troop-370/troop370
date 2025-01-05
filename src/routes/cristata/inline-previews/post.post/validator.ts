import { page } from '$app/stores';
import { PUBLIC_NEW_FILESTORE_PATH, PUBLIC_OLD_FILESTORE_PATH } from '$env/static/public';
import { notEmpty } from '$utils';
import { get } from 'svelte/store';
import { z } from 'zod';

export const validator = z.object({
  slug: z.string().default(''),
  submitted_by: z
    .string()
    .nullable()
    .default(null)
    .transform((val) => (val ? val.split(';') : null)),
  title: z.string().default(''),
  theme: z.string().nullable().default('post'),
  body: z.string().default(''),
  enable_password_protection: z.boolean().nullable().default(false),
  category: z
    .object({
      label: z.string().default(''),
    })
    .nullable()
    .array()
    .default([])
    .transform((c) => c.filter(notEmpty)),
  tags: z
    .object({
      label: z.string().default(''),
    })
    .nullable()
    .array()
    .default([]),
  subtitle: z.string().default(''),
  publishedAt: z.string().nullable().default(null),
  shortPublishedAt: z.string().nullable().default(null),
  cover_photo: z
    .object({
      url: z.string().nullable().default(null),
      caption: z.string().nullable().default(null),
    })
    .nullable()
    .default(null)
    .transform((val) => {
      return {
        url: val?.url?.replace(
          PUBLIC_OLD_FILESTORE_PATH,
          PUBLIC_NEW_FILESTORE_PATH.replace('https://troop370atlanta.org', get(page).url.origin)
        ),
        credit: val?.caption ?? undefined,
      };
    }),
  cover_photo_caption: z.string().nullable().default(null),
});
