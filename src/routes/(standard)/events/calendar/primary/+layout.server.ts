import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import z from 'zod';

const eventsValidator = z.object({
  kind: z.literal('calendar#events'),
  etag: z.string(),
  summary: z.string(),
  updated: z.string(),
  timeZone: z.string(),
  accessRole: z.string(),
  nextPageToken: z.string().optional(),
  nextSyncToken: z.string().optional(),
  items: z
    .object({
      kind: z.literal('calendar#event'),
      etag: z.string().nullable(),
      id: z.string(),
      iCalUID: z.string().nullable(),
      htmlLink: z.string().nullable(),
      created: z.string(),
      updated: z.string(),
      summary: z.string().optional(),
      description: z.string().optional().nullable(),
      location: z.string().optional(),
      colorId: z.string().optional(),
      recurrence: z.string().array().optional(),
      start: z
        .object({
          date: z.string().optional(),
          dateTime: z.string().optional(),
          timeZone: z.string().optional(),
        })
        .optional(),
      end: z
        .object({
          date: z.string().optional(),
          dateTime: z.string().optional(),
          timeZone: z.string().optional(),
        })
        .optional(),
    })
    .array(),
  eventType: z
    .union([z.literal('default'), z.literal('outOfOffice'), z.literal('foucsTime')])
    .optional(),
});

export const load: LayoutServerLoad = async ({ parent }) => {
  const { session } = await parent();

  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/370scouts@gmail.com/events`
  );
  url.searchParams.set('timeMin', new Date().toISOString());
  url.searchParams.set('key', 'AIzaSyBmElmhcmElKP6tgPiasvZVeA--DFq2dbQ');

  try {
    const calendarData = await fetch(url, { headers: { Accept: 'application/json' } }).then((res) =>
      res.json()
    );

    const calendar = eventsValidator.parse(calendarData);

    if (session.authenticated !== true) {
      return {
        calendar: {
          ...calendar,
          items: calendar.items.map((item) => {
            return {
              ...item,
              htmlLink: null,
              description: null,
              etag: null,
              iCalUID: null,
            };
          }),
        },
      };
    }

    return { calendar };
  } catch (err) {
    console.error(err);
    error(500, err instanceof Error ? err : undefined);
  }
};
