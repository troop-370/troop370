import * as csvParser from 'csv-to-js-parser';

type Fetch = typeof fetch;

export async function fetchZip4s_client(fetch: Fetch, csv: string) {
  let parsed = csvParser.csvToObj(csv);

  await parsed.reduce((accumulatorPromise, obj) => {
    return accumulatorPromise.then(async () => {
      const url = obj['Zip plus 4 Search']
        .replace('=HYPERLINK("', '')
        .replace('", "postoffice")', '');

      const zipPlus4 = await fetch(url)
        .then((res) => res.text())
        .then((html) => {
          const addressLoc = html.indexOf(`<div id="address">`);
          const htmlAfterAddress = html.slice(addressLoc);
          const spanTagOpen = `<span style="color:#E60000;">`;
          const spanTagClose = `</span>`;
          const ZIP9 = htmlAfterAddress.slice(
            htmlAfterAddress.indexOf(spanTagOpen) + spanTagOpen.length,
            htmlAfterAddress.indexOf(spanTagClose)
          );
          return ZIP9;
        })
        .then((zip9) => zip9.slice(6));

      // wait so that we are not rate limited
      await wait(1000);

      obj['Zip plus 4'] = zipPlus4;
      return Promise.resolve();
    });
  }, Promise.resolve());

  parsed = parsed.sort((a, b) => {
    return new Date(a['Date received']) > new Date(b['Date received']) ? -1 : 1;
  });

  return csvParser.objToCsv(parsed);

  const _rows = csv.split('\n');
  const header = _rows[0];
  const rows = _rows.slice(1);

  const attributes = header.split('","');
  const zip4Pos = attributes.findIndex((attr) => attr.toLowerCase() === 'zip plus 4');

  const rowsWithZip4 = rows.map((row) => {
    const cells = row.split('","');
    cells[zip4Pos] = '0000';
    return cells.join('","');
  });

  return [header, ...rowsWithZip4].join('\n');

  const zipPlus4 = await fetch(
    'https://www.zip-codes.com/search.asp?fld-address=765%20Stovall%20Blvd%20NE&fld-address2=&fld-city=Atlanta&fld-state=GA&fld-zip=30342&srch-type=address&selectTab=1&Submit=Find+ZIP+Code+of+this+U.S.+Address'
  )
    .then((res) => res.text())
    .then((html) => {
      const addressLoc = html.indexOf(`<div id="address">`);
      ``;
      const htmlAfterAddress = html.slice(addressLoc);
      const spanTagOpen = `<span style="color:#E60000;">`;
      const spanTagClose = `</span>`;
      const ZIP9 = htmlAfterAddress.slice(
        htmlAfterAddress.indexOf(spanTagOpen) + spanTagOpen.length,
        htmlAfterAddress.indexOf(spanTagClose)
      );
      return ZIP9;
    })
    .then((zip9) => zip9.slice(6));

  console.log(zipPlus4);
}

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
