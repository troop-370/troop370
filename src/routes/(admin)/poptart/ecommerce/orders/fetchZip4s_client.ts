import * as csvParser from 'csv-to-js-parser';
import type { GeocoderResponse } from '../../geocoder/address/+server';

type Fetch = typeof fetch;

export async function fetchZip4s_client(fetch: Fetch, csv: string, abortSignal: AbortSignal) {
  let parsed = csvParser.csvToObj(csv);

  await parsed.reduce(async (accumulatorPromise, obj) => {
    return accumulatorPromise.then(async () => {
      if (abortSignal.aborted) {
        return Promise.reject(new Error('Aborted'));
      }

      const geocoderHref = obj['Zip plus 4 Search']
        ?.replace('=HYPERLINK("', '')
        .replace('", "postoffice")', '');
      if (!geocoderHref) {
        return Promise.resolve();
      }

      let geocoderUrl: URL | null = null;
      try {
        geocoderUrl = new URL(geocoderHref);
      } catch (error) {
        console.warn(`Invalid geocoder URL: ${geocoderHref}`);
        return Promise.resolve();
      }

      const geocoded = await fetch(geocoderUrl, {
        headers: { Accept: 'application/json' },
        signal: abortSignal,
      }).then((res): Promise<GeocoderResponse | null> => {
        if (!res.ok) {
          console.warn(
            `Failed to fetch geocoder data for ${geocoderUrl.href}: ${res.status} ${res.statusText}`
          );
          return Promise.resolve(null);
        }
        return res.json();
      });

      // wait so that we are not rate limited
      // await wait(1000);

      if (geocoded) {
        obj['Full Address'] = geocoded.addressMatch.matchedAddress;
        obj['Zip plus 4'] = geocoded.addressMatch.addressComponents.staleZipPlus4 || '';
      }
      return Promise.resolve();
    });
  }, Promise.resolve());

  parsed = parsed.sort((a, b) => {
    return new Date(a['Date received']) > new Date(b['Date received']) ? -1 : 1;
  });

  return csvParser.objToCsv(parsed);
}

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
