import { render_response } from './render.js';
import { load_node } from './load_node.js';

/**
 * @param {{
 *   request: import('types/endpoint').ServerRequest;
 *   options: import('types/internal').SSRRenderOptions;
 *   $session: any;
 *   status: number;
 *   error: Error;
 * }} opts
 */
export async function respond_with_error({ request, options, $session, status, error }) {
	const default_layout = await options.load_component(options.manifest.layout);
	const default_error = await options.load_component(options.manifest.error);

	const page = {
		host: request.host,
		path: request.path,
		query: request.query,
		params: {}
	};

	const loaded = await load_node({
		request,
		options,
		route: null,
		page,
		node: default_layout,
		$session,
		context: {},
		is_leaf: false,
		is_error: false
	});

	const branch = [
		loaded,
		await load_node({
			request,
			options,
			route: null,
			page,
			node: default_error,
			$session,
			context: loaded.context,
			is_leaf: false,
			is_error: true,
			status,
			error
		})
	];

	try {
		return await render_response({
			request,
			options,
			$session,
			page_config: {
				hydrate: options.hydrate,
				router: options.router,
				ssr: options.ssr
			},
			status,
			error,
			branch,
			page
		});
	} catch (error) {
		return {
			status: 500,
			headers: {},
			body: options.dev ? error.stack : error.message
		};
	}
}
