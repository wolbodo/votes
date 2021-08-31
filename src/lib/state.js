8// Stores all state
import jwt from 'jsonwebtoken'
import { getCookies } from '$lib/cookies';

export let options = {}
export let subject = ''
export let currentVote = null
export let pastVotes = []

export function setSubject(sub) {
	subject = sub
	updateUsers()
}


const MERCURE_JWT_SECRET = process.env['MERCURE_JWT_SECRET'] || '!ChangeMe!'
const TOPIC = 'https://vote.wolbodo.nl/state.json'

function createToken() {
	return jwt.sign({
		mercure: {
			subscribe: ["*"],
			publish: ["*"]
		}
	}, MERCURE_JWT_SECRET, {
		expiresIn: '15s'
	})
}
async function getActiveUsers() {
	const response = await fetch(`https://mercure.wolbodo.nl/.well-known/mercure/subscriptions/${encodeURIComponent(TOPIC)}`, {
		headers: {
			Authorization: `Bearer ${createToken()}`
		}
	})
	const data = await response.json()

	return new Set(data.subscriptions
		.filter(({ active }) => active)
		.map(({ payload }) => payload.name)
	)
}
export function currentState() {
	return {
		subject,
		options,
		currentVote: currentVote ? Object.fromEntries(
			Object.entries(currentVote)
				.filter(([key]) => ['options', 'users', 'subject'].includes(key))
			) : null,
		pastVotes
	}
}
export function updateUsers() {
	fetch('https://mercure.wolbodo.nl/.well-known/mercure', {
    method: 'POST',
		headers: {
			Authorization: `Bearer ${createToken()}`
		},
    body: new URLSearchParams({
        'topic': TOPIC,
        'private': 'on',
        'data': JSON.stringify({
					'@context': 'https://vote.wolbodo.nl/',
					state: currentState()
				})
    })
	});
}

export function getUsername(headers) {
	// TODO: verify cookie domain
	const { token } = getCookies(headers.cookie);
	const { name } = jwt.decode(token)
	return name
}
export function isBoard(headers) {
	const { token } = getCookies(headers.cookie);
	const { roles } = jwt.decode(token)

	return roles.includes('board')
}

export async function startVote() {
	if (currentVote) return

	const users = [...await getActiveUsers()]
	currentVote = {
		options,
		subject,
		users,
		allUsers: users,
		votes: {
			__invalid__: 0,
			...Object.fromEntries(Object.entries(options).map(([key]) => ([key, 0])))
		}
	}
	console.log("Starting vote: ", subject)
	console.log("\toptions: ", Object.values(options))
	console.log("\tusers: ", users)
	
	options = {}
	subject = ''

	updateUsers()
}

export function castVote(name, vote) {
	// Validate vote
	if (!currentVote) return
	if (!currentVote.users.includes(name)) return

	// Count the vote
	if (vote in currentVote.options) {
		currentVote.votes[vote] ++
	} else {
		currentVote.votes.__invalid__ ++
	}

	// Remove the user from allowed voters
	currentVote.users = currentVote.users.filter(user => user !== name)

	if (!currentVote.users.length) {
		endVote()
	} else {
		updateUsers()
	}
}

export async function endVote() {
	const result = {
		subject: currentVote.subject,
		options: currentVote.options,
		votes: currentVote.votes,
		users: currentVote.allUsers
	}

	// Add the invalid votes for all users who didn't vote
	result.votes.__invalid__ += currentVote.users.length

	console.log("Closed vote:", result.subject)
	console.log("\tvotes:", result.votes)

	pastVotes.push(result)
	currentVote = null
	
	updateUsers()
}