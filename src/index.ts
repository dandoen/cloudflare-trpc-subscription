import { initTRPC } from '@trpc/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

const t = initTRPC.context().create();

const router = t.router({
	greet: t.procedure.query(() => {
		return 'Hello!';
	}),
	randomNumber: t.procedure.subscription(async function* (_opts) {
		console.log('request made it to the stream procedure...');
		for (let i = 0; i < 8; i++) {
			console.log('emitting random number');
			await new Promise((resolve) => setTimeout(resolve, 500));
			yield i;
		}
	}),
});

export type Router = typeof router;

export default {
	async fetch(request: Request): Promise<Response> {
		console.log('[worker] Incoming request to:', request.url);
		try {
			return fetchRequestHandler({
				router,
				req: request,
				endpoint: '/',
				createContext: (opts) => opts,
			});
		} catch (err) {
			console.error('[worker] Error in fetch handler:', err);
			throw err;
		}
	},
};
