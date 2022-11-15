/// <references types="houdini-svelte">

/** @type {import('houdini').ConfigFile} */
const config = {
	apiUrl: 'https://server.cristata.app/v3/troop-370',
	plugins: {
		'houdini-svelte': {
			client: './src/client'
		}
	},
	scalars: {
		Date: { type: 'string' },
		JSON: { type: 'string' },
		ObjectID: { type: 'string' },
		Void: { type: null }
	}
};

export default config;
