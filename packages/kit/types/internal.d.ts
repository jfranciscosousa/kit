import { Load } from './page';
import { Incoming, GetContext, GetSession, Handle } from './hooks';
import { RequestHandler, ServerResponse } from './endpoint';

declare global {
	interface ImportMeta {
		env: Record<string, string>;
	}
}

type PageId = string;

export type Logger = {
	(msg: string): void;
	success: (msg: string) => void;
	error: (msg: string) => void;
	warn: (msg: string) => void;
	minor: (msg: string) => void;
	info: (msg: string) => void;
};

export type App = {
	init: ({
		paths,
		prerendering
	}: {
		paths: {
			base: string;
			assets: string;
		};
		prerendering: boolean;
	}) => void;
	render: (incoming: Incoming, options: SSRRenderOptions) => ServerResponse;
};

export type SSRComponent = {
	ssr?: boolean;
	router?: boolean;
	hydrate?: boolean;
	prerender?: boolean;
	preload?: any; // TODO remove for 1.0
	load: Load;
	default: {
		render: (
			props: Record<string, any>
		) => {
			html: string;
			head: string;
			css: string;
		};
	};
};

export type SSRComponentLoader = () => Promise<SSRComponent>;

export type CSRComponent = any; // TODO

export type CSRComponentLoader = () => Promise<CSRComponent>;

export type SSRPagePart = {
	id: string;
	load: SSRComponentLoader;
};

export type GetParams = (match: RegExpExecArray) => Record<string, string>;

export type SSRPage = {
	type: 'page';
	pattern: RegExp;
	params: GetParams;
	// plan a is to render 1 or more layout components followed
	// by a leaf component. if one of them fails in `load`, we
	// backtrack until we find the nearest error component —
	// plan b — and render that instead
	a: PageId[];
	b: PageId[];
};

export type SSREndpoint = {
	type: 'endpoint';
	pattern: RegExp;
	params: GetParams;
	load: () => Promise<{
		[method: string]: RequestHandler;
	}>;
};

export type SSRRoute = SSREndpoint | SSRPage;

export type CSRPage = [RegExp, CSRComponentLoader[], CSRComponentLoader[], GetParams?];

export type CSREndpoint = [RegExp];

export type CSRRoute = CSREndpoint | CSRPage;

export type SSRManifest = {
	assets: Asset[];
	layout: string;
	error: string;
	routes: SSRRoute[];
};

export type Hooks = {
	getContext?: GetContext;
	getSession?: GetSession;
	handle?: Handle;
};

export type SSRNode = {
	module: SSRComponent;
	entry: string; // client-side module corresponding to this component
	css: string[];
	js: string[];
	styles: string[];
};

// TODO separate out runtime options from the ones fixed in dev/build
export type SSRRenderOptions = {
	paths?: {
		base: string;
		assets: string;
	};
	local?: boolean;
	template?: ({ head, body }: { head: string; body: string }) => string;
	manifest?: SSRManifest;
	load_component?: (id: PageId) => Promise<SSRNode>;
	target?: string;
	entry?: string;
	css?: string[];
	js?: string[];
	root?: SSRComponent['default'];
	hooks?: Hooks;
	dev?: boolean;
	amp?: boolean;
	dependencies?: Map<string, ServerResponse>;
	only_render_prerenderable_pages?: boolean;
	get_stack?: (error: Error) => string;
	get_static_file?: (file: string) => Buffer;
	fetched?: string;
	initiator?: SSRPage;
	ssr?: boolean;
	router?: boolean;
	hydrate?: boolean;
};

export type Asset = {
	file: string;
	size: number;
	type: string;
};

export type PageData = {
	type: 'page';
	pattern: RegExp;
	params: string[];
	path: string;
	a: string[];
	b: string[];
};

export type EndpointData = {
	type: 'endpoint';
	pattern: RegExp;
	params: string[];
	file: string;
};

export type RouteData = PageData | EndpointData;

export type ManifestData = {
	assets: Asset[];
	layout: string;
	error: string;
	components: string[];
	routes: RouteData[];
};

export type BuildData = {
	client: string[];
	server: string[];
	static: string[];
	entries: string[];
};
