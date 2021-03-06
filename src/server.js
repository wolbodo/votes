import http from 'http'
import sirv from 'sirv'
import polka from 'polka'
import compression from 'compression'
import * as sapper from '@sapper/server'
import { json } from '@polka/parse'
import WebSocket from 'ws'
import session from 'express-session'

import Assembly from './assembly.js'

const { PORT, NODE_ENV } = process.env
const dev = NODE_ENV === 'development'

const sessionParser = session({
	secret: 'keyboard cat',
	cookie: {},
	resave: true,
	saveUninitialized: true
})

const server = http.createServer()
const app = polka({ server }) // You can also use Express
	.use(json())
  	.use(sessionParser)
	.use(
		compression({ threshold: 0 }),
		sirv('static', { dev }),
		sapper.middleware({
			session: (req) => ({
				id: req.session.id,
				data: req.session.data
			})
		})
	)

const wss = new WebSocket.Server({ noServer: true })

const isAdmin = (func) => ({ assembly, sessionId, ...rest }) => {
	const session = assembly.sessions.get(sessionId)
	if (session.inLobby && session.isAdmin) {
		return func({ assembly, sessionId, ...rest })
	}

	throw new Error("Can't allow that Dave")
}

const protocol = {
	join({ assembly, sessionId, ws }) {
		assembly.joinSocket(sessionId, ws)
	},
	setAdmin: isAdmin(({ assembly, data: { name, isAdmin = true } }) => {
		console.log(name, isAdmin ? "became admin" : "is no admin anymore")
		const targetId = assembly.getSessionIdByName(name)
		assembly.updateSession(targetId, { isAdmin })
	}),
	setLobby: isAdmin(({ assembly, data: { name, inLobby } }) => {
		const targetId = assembly.getSessionIdByName(name)
		if (!inLobby) {
			console.log(name, "left lobby")
			assembly.removeSession(targetId)
		} else {
			console.log(name, "joined lobby")
			assembly.updateSession(targetId, { inLobby })
		}
	}),
	setPollInfo: isAdmin(({ assembly, data }) => {
		console.log("setPollInfo", data)
		assembly.setPollInfo(data)
	}),
	addPollOption: isAdmin(({ assembly, data: { option } }) => {
		console.log("addPollOption", option)
		assembly.addPollOption(option)
	}),
	removePollOption: isAdmin(({ assembly, data: { option } }) => {
		console.log("removePollOption", option)
		assembly.removePollOption(option)
	}),
	startPoll: isAdmin(({ assembly }) => assembly.startPoll()),
	castVote: ({ assembly, sessionId, data: { vote } }) => {
		assembly.castVote(sessionId, vote)
	},
	endPoll: isAdmin(({ assembly }) => assembly.endPoll()),
	identifyUser({ assembly, sessionId, data: { name } }, ws) {
		if (assembly.getSessionIdByName(name)) {
			throw new Error('Name already in use')
		}

		console.log(name, "wants to join")
		assembly.join(sessionId, { name })
	},
	ping({ sessionId }) {
		console.log("ping from", ${sessionId})
	}
}

wss.on('connection', function connection(ws, request) {
	const sessionId = request.session.id
	const assemblyId = request.url.slice(1)
	
	ws.on('message', msg => {
		const assembly = Assembly.byId(assemblyId)
		
		if (!assembly) {
			ws.send(JSON.stringify({ type: 'error' }))
			return
		}
		const { data, type } = JSON.parse(msg)
		
		if (!assembly.sessions.has(sessionId) && type !== 'identifyUser') {
			ws.send(JSON.stringify({ type: 'requestIdentity' }))
			return
		}
		const action = protocol[type] || (() => console.warn("Unknown message received", type))

		try {
			action({ type, assembly, sessionId, ws, data })
		} catch (e) {
			console.log("Had error:", e.name, e.message )
			ws.send(JSON.stringify({
				type: 'error',
				data: {
					name: e.name,
					message: e.message
				}
			}))
		}
	})

	ws.on('close', () => {
		const assembly = Assembly.getAssemblyByClientId(sessionId)
		if (assembly) {
			const session = assembly.sessions.get(sessionId)
			if (!session) {
				console.log(`Close: 'unknown' closed socket`)
			} else {
				console.log(`Close: '${session.identity.name}' closed socket`)
			}
			assembly.sendAssemblyData()
		}
	})
	ws.on('error', () => {
		const assembly = Assembly.getAssemblyByClientId(sessionId)
		if (assembly) {
			const session = assembly.sessions.get(sessionId)
			if (!session) {
				console.log(`Error: 'unknown' closed socket`)
			} else {
				console.log(`Error: '${session.identity.name}' closed socket`)
			}
			assembly.sendAssemblyData()
		}
	})
})

server.on('upgrade', function upgrade(request, socket, head) {
  // This function is not defined on purpose. Implement it with your own logic.
  sessionParser(request, {}, () => {
		const assemblyId = request.url.replace('/', '')
    if (!Assembly.byId(assemblyId)) {
			console.log("Could not find assembly", assemblyId, Assembly.assemblies)
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
      return
    }

    wss.handleUpgrade(request, socket, head, function (ws) {
      wss.emit('connection', ws, request)
    })
  })
})

app.listen(PORT, err => {
	if (err) console.log('error', err)
})
