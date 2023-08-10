import { HoudiniClient } from '$houdini';

export default new HoudiniClient({
  url: 'https://server.cristata.app/v3/troop-370',
  fetchParams: ({ text = '', variables = {}, metadata }) => {
    return {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(metadata?.token ? { Authorization: `app-token ${metadata.token}` } : {}),
        ...(metadata?.headers ?? {}),
      },
      body: JSON.stringify({
        query: text,
        variables,
      }),
    };
  },
});
