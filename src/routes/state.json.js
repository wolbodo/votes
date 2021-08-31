// Returns the state// Add, remove or update options.
import { currentState } from '$lib/state'


/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function get({headers}) {
	return {
		body: currentState()
	};
}

