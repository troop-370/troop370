import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, request }) => {
  const searchParams = url.searchParams;
  const accepts = request.headers.get('accept') || '';
  if (!accepts.includes('application/json') && !accepts.includes('text/html')) {
    return new Response(
      JSON.stringify({ error: 'Accept header must include application/json or text/html' }),
      {
        status: 406,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const earlyResponse = constructResponse.bind(
    null,
    accepts.includes('application/json') ? 'json' : 'html',
    url
  );

  const street = searchParams.get('street');
  if (!street) {
    return earlyResponse(
      { street: '', city: '', state: '', zip: '' },
      400,
      'Missing required parameter: street'
    );
  }

  const city = searchParams.get('city');
  if (!city) {
    return earlyResponse(
      { street, city: '', state: '', zip: '' },
      400,
      'Missing required parameter: city'
    );
  }

  const state = searchParams.get('state');
  if (!state) {
    return earlyResponse(
      { street, city, state: '', zip: '' },
      400,
      'Missing required parameter: state'
    );
  }

  const zip = searchParams.get('zip');
  if (!zip) {
    return earlyResponse({ street, city, state, zip: '' }, 400, 'Missing required parameter: zip');
  }

  const response = earlyResponse.bind(null, { street, city, state, zip });

  const benchmark = searchParams.get('benchmark');
  const benchmarkVintage = searchParams.get('vintage');

  const geocoderQueryUrl = new URL('https://geocoding.geo.census.gov/geocoder/geographies/address');
  geocoderQueryUrl.searchParams.set('street', street || '');
  geocoderQueryUrl.searchParams.set('city', city || '');
  geocoderQueryUrl.searchParams.set('state', state || '');
  geocoderQueryUrl.searchParams.set('zip', zip || '');
  geocoderQueryUrl.searchParams.set('benchmark', benchmark ?? '4'); // 4 == Public_AR_Current
  geocoderQueryUrl.searchParams.set('vintage', benchmarkVintage ?? '4'); // 4 == Current_Current
  geocoderQueryUrl.searchParams.set('format', 'json');

  const censusGeocoderData = await fetch(geocoderQueryUrl).then(
    (res): Promise<Record<string, unknown>> => res.json()
  );

  if (
    censusGeocoderData &&
    typeof censusGeocoderData === 'object' &&
    'errors' in censusGeocoderData
  ) {
    return response(500, { errors: censusGeocoderData.errors });
  }

  if (
    !censusGeocoderData ||
    typeof censusGeocoderData !== 'object' ||
    !('result' in censusGeocoderData) ||
    typeof censusGeocoderData.result !== 'object' ||
    !censusGeocoderData.result
  ) {
    return response(500, 'Failed to retrieve valid geocoder response');
  }

  if (
    !('addressMatches' in censusGeocoderData.result) ||
    !Array.isArray(censusGeocoderData.result.addressMatches)
  ) {
    return response(500, 'Failed to retrieve valid address matches from geocoder response');
  }

  if (censusGeocoderData.result.addressMatches.length === 0) {
    // fall back to decennial census 2020 benchmark if the current benchmark didn't return any matches
    if (benchmark !== '2020' && benchmarkVintage !== '2020') {
      const redirectUrl = new URL(url);
      redirectUrl.searchParams.set('benchmark', '2020');
      redirectUrl.searchParams.set('vintage', '2020');

      return new Response(
        JSON.stringify({
          error:
            'No address matches found for the provided parameters. Follow the redirect to try again with the decennial census 2020 benchmark.',
        }),
        {
          status: 307,
          headers: {
            'Content-Type': 'application/json',
            Location: redirectUrl.href,
          },
        }
      );
    }

    return response(404, 'No address matches found for the provided parameters');
  }

  const maybeCoordinates = censusGeocoderData.result.addressMatches[0].coordinates;
  if (
    !maybeCoordinates ||
    typeof maybeCoordinates.x !== 'number' ||
    typeof maybeCoordinates.y !== 'number'
  ) {
    return response(500, 'Failed to retrieve valid coordinates from geocoder response');
  }
  const coordinates = { x: maybeCoordinates.x as number, y: maybeCoordinates.y as number };

  let resolvedAddress = censusGeocoderData.result.addressMatches[0].matchedAddress;
  if (!resolvedAddress || typeof resolvedAddress !== 'string') {
    return response(500, 'Failed to retrieve valid matched address from geocoder response');
  }
  resolvedAddress = resolvedAddress.trim();

  // As of Match 11, 2026, most Sandy Springs zip codes should not use Atlanta.
  // See: https://www.sandyspringsga.gov/news/sandy-springs-granted-last-line-zip-codes
  const sandySpringsZipCodes = ['30319', '30327', '30328', '30338', '30339', '30342', '30350'];
  if (sandySpringsZipCodes.some((zipCode) => resolvedAddress.endsWith(zipCode))) {
    resolvedAddress = resolvedAddress.replace(', ATLANTA, GA', ', SANDY SPRINGS, GA');
  }

  if (
    !('input' in censusGeocoderData.result) ||
    typeof censusGeocoderData.result.input !== 'object' ||
    censusGeocoderData.result.input === null ||
    !('benchmark' in censusGeocoderData.result.input) ||
    !censusGeocoderData.result.input.benchmark ||
    typeof censusGeocoderData.result.input.benchmark !== 'object' ||
    !('id' in censusGeocoderData.result.input.benchmark) ||
    typeof censusGeocoderData.result.input.benchmark.id !== 'string'
  ) {
    return response(500, 'Failed to retrieve valid benchmark from geocoder response');
  }

  const zipPlus4ServiceQueryUrl = new URL(
    'https://services5.arcgis.com/buITjRsK0rZsAXbQ/ArcGIS/rest/services/ZIPCodesPlus4/FeatureServer/0/query'
  );
  zipPlus4ServiceQueryUrl.searchParams.set('geometry', `${coordinates.x},${coordinates.y}`);
  zipPlus4ServiceQueryUrl.searchParams.set('geometryType', 'esriGeometryPoint');
  zipPlus4ServiceQueryUrl.searchParams.set('inSR', '4326');
  zipPlus4ServiceQueryUrl.searchParams.set('spatialRel', 'esriSpatialRelIntersects');
  zipPlus4ServiceQueryUrl.searchParams.set('outFields', 'F_full_zipcode_');
  zipPlus4ServiceQueryUrl.searchParams.set('returnGeometry', 'true');
  zipPlus4ServiceQueryUrl.searchParams.set('f', 'pgeojson');

  const zip9 = await fetch(zipPlus4ServiceQueryUrl)
    .then((res) => res.json())
    .then((data) => {
      const zip9 = data.features[0]?.properties?.F_full_zipcode_;
      if (typeof zip9 !== 'string') return null;

      // validate zipPlus4 values
      const parts = zip9.split('-');
      if (parts.length !== 2) return null;
      if (parts[0].length !== 5 || parts[1].length !== 4) return null;
      if (!Number.isInteger(Number(parts[0])) || !Number.isInteger(Number(parts[1]))) return null;

      return { zip5: parts[0], plus4: parts[1], zip9: parts[0] + '-' + parts[1] };
    });

  const data = {
    input: { street, city, state, zip },
    benchmark: censusGeocoderData.result.input.benchmark,
    addressMatch: {
      ...censusGeocoderData.result.addressMatches[0],
      addressComponents: {
        ...censusGeocoderData.result.addressMatches[0].addressComponents,
        staleZip5: zip9
          ? zip9.zip5
          : censusGeocoderData.result.addressMatches[0].addressComponents.zip,
        staleZipPlus4: zip9 ? zip9.plus4 : undefined,
      },
      coordinates,
      // add the plus4 to the matchedAddress if the zip5 is still the same as the resolvedAddress zip5
      matchedAddress:
        zip9 && resolvedAddress.endsWith(zip9.zip5)
          ? `${resolvedAddress}-${zip9.plus4}`
          : resolvedAddress,
    },
  } satisfies GeocoderResponse;

  return response(200, data);
};

export interface GeocoderResponse {
  input: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  benchmark: object & Record<'id', unknown>;
  addressMatch: {
    matchedAddress: string;
    coordinates: {
      x: number;
      y: number;
    };
    addressComponents: Record<string, string> & {
      staleZip5?: string;
      staleZipPlus4?: string;
    };
  };
}

function recordToUnorderedList(record: Record<string, unknown>) {
  const listItems = Object.entries(record)
    .map(([key, value]) => `<li>${key}: ${value}</li>`)
    .join('\n');
  return `<ul>\n${listItems}\n</ul>`;
}

function constructResponse(
  contentType: 'json' | 'html',
  url: URL,
  input: { street: string; city: string; state: string; zip: string },
  status: number,
  body: GeocoderResponse | string | { errors: unknown }
) {
  if (contentType === 'json') {
    return new Response(JSON.stringify(typeof body === 'string' ? { error: body } : body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    `<html><body>
        <style>
          html {
            color-scheme: light dark;
            font-family: system-ui, sans-serif;
            line-height: 1.5;
          }

          input:not([type="submit"]) {
            margin-bottom: 0.5rem;
          }
          input[type="submit"] {
            margin-top: 0.5rem;
          }
        </style>

        <h1>Troop 370 Geocoder</h1>

        <h2>Input</h2>
        <form method="get" action="${url.origin + url.pathname}">
          <fieldset style="display: inline-block;>
            <label for="street">Street:</label>
            <input type="text" id="street" name="street" value="${input.street}" required><br>
            <label for="city">City:</label>
            <input type="text" id="city" name="city" value="${input.city}" required><br>
            <label for="state">State:</label>
            <input type="text" id="state" name="state" value="${input.state}" required><br>
            <label for="zip">ZIP:</label>
            <input type="text" id="zip" name="zip" value="${input.zip}" required><br>
            <input type="submit" value="Submit">
          </fieldset>
        </form>

        ${
          typeof body === 'string' || status !== 200 || 'errors' in body
            ? `<h2>Error</h2><pre>${body}</pre>`
            : `
        <h2>Response</h2>
    
        <h3>Coordinates</h3>
        <ul>
          <li>Latitude (Y): ${body.addressMatch.coordinates.y}</li>
          <li>Longitude (X): ${body.addressMatch.coordinates.x}</li>
        </ul>

        <h3>Matched Address</h3>
        <pre>${body.addressMatch.matchedAddress}</pre>

        <h3>Address Components</h3>
        ${recordToUnorderedList(body.addressMatch.addressComponents)}
        
        <h3>Benchmark</h2>
        ${recordToUnorderedList(body.benchmark)}

        <p>About benchmarks and the geocoder: <a href="https://geocoding.geo.census.gov/geocoder/Geocoding_Services_API.html">https://geocoding.geo.census.gov/geocoder/Geocoding_Services_API.html</a> (US Census Bureau)</p>
        <p>ZIP Code + 4 feature service: <a href="https://www.arcgis.com/home/item.html?id=fb12a021628f49f7bb5a32bad75c3d93">https://www.arcgis.com/home/item.html?id=fb12a021628f49f7bb5a32bad75c3d93</a> (Sandy Springs, GA)</p>

        `
        }
        
      </body></html>`,
    {
      status,
      headers: { 'Content-Type': 'text/html' },
    }
  );
}
