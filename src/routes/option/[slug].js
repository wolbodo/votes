// Add, remove or update options.
import { isBoard, options, updateUsers } from '$lib/state'

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function patch({ params, body, headers }) {
	if (!isBoard(headers)) {
		return {
			status: 401,
			body: "Unauthorized"
		}
	}
	const { slug } = params;

	options[slug] = body
	updateUsers()

	return {}
}

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
 export function del({ params, headers }) {
	if (!isBoard(headers)) {
		return {
			status: 401,
			body: "Unauthorized"
		}
	}
	const { slug } = params;

	delete options[slug]
	updateUsers()

	return {}
}
