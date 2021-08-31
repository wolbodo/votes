// Add, remove or update options.
import { getUsername, castVote } from '$lib/state'

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export function post({ headers, body }) {
  const name = getUsername(headers)
  
  castVote(name, body)
  
	return {}
}
