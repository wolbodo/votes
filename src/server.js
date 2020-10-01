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
}
const protocol = {
	join({ assembly, sessionId, ws }) {
		console.log("Join on", assembly)
		assembly.joinSocket(sessionId, ws)
	},
	setAdmin: isAdmin(({ assembly, data: { name, isAdmin = true } }) => {
		const targetId = assembly.getSessionIdByName(name)
		assembly.updateSession(targetId, { isAdmin })
	}),
	setLobby: isAdmin(({ assembly, data: { name, inLobby } }) => {
		const targetId = assembly.getSessionIdByName(name)
		if (!inLobby) {
			assembly.removeSession(targetId)
		} else {
			assembly.updateSession(targetId, { inLobby })
		}
	}),
	setPollInfo: isAdmin(({ assembly, data }) => {
		assembly.setPollInfo(data)
	}),
	addPollOption: isAdmin(({ assembly, data: { option } }) => {
		assembly.addPollOption(option)
	}),
	removePollOption: isAdmin(({ assembly, data: { option } }) => {
		assembly.removePollOption(option)
	}),
}


wss.on('connection', function connection(ws, request) {
	const sessionId = request.session.id
	
	ws.on('message', msg => {
		const assembly = Assembly.getAssemblyByClientId(sessionId)
		console.log(`Received message ${msg} from user ${sessionId}`, !!assembly)
		
		if (!assembly) {
			ws.send(JSON.stringify({ type: 'requestIdentity' }))
			return
		}
		const { data, type } = JSON.parse(msg)
		const action = protocol[type] || (() => console.warn("Unknown message received", type))

		action({ type, assembly, sessionId, ws, data })
	})

	ws.on('close', () => {
		const assembly = Assembly.getAssemblyByClientId(sessionId)
		if (assembly) {
			console.log(`Close: ${assembly.sessions.get(sessionId).identity.name} closed socket`)
			assembly.sendClientList()
		}
	})
	ws.on('error', () => {
		const assembly = Assembly.getAssemblyByClientId(sessionId)
		if (assembly) {
			console.log(`Error: ${assembly.sessions.get(sessionId).identity.name} closed socket`)
			assembly.sendClientList()
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
