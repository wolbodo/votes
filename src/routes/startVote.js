// Add, remove or update options.
import { isBoard, startVote } from '$lib/state'

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export function get({ headers }) {
  if (!isBoard(headers)) {
		return {
			status: 401,
			body: "Unauthorized"
		}
  }

  startVote()

	return {}
}
