import { HoudiniClient, type RequestHandlerArgs } from '$houdini';

async function fetchQuery({ fetch, text = '', variables = {} }: RequestHandlerArgs) {
  const url = 'https://server.cristata.app/v3/troop-370';
  const result = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: text,
      variables,
    }),
  });
  return await result.json();
}

export default new HoudiniClient(fetchQuery);
