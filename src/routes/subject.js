// Add, remove or update options.
import { isBoard, setSubject } from '$lib/state'

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export function post({ headers, body }) {
  if (!isBoard(headers)) {
		return {
			status: 401,
			body: "Unauthorized"
		}
  }

  setSubject(body)

	return {}
}
