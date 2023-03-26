import { HoudiniClient } from '$houdini';

export default new HoudiniClient({
  url: 'https://server.cristata.app/v3/troop-370',
  fetchParams: ({ text = '', variables = {} }) => {
    return {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: text,
        variables,
      }),
    };
  },
});
