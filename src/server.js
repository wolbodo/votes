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

wss.on('connection', function connection(ws, request, client) {
	
	ws.on('message', msg => {
		console.log(`Received message ${msg} from user ${request.session.id}`)
		
		const { data, type } = JSON.parse(msg)
		switch (type) {
			case 'join':
				const assembly = Assembly.getAssemblyByClientId(request.session.id)
				console.log("Join on", assembly)
				if (!assembly) {
					ws.send(JSON.stringify({ type: 'requestIdentity' }))
				} else {
					assembly.joinSocket(request.session.id, ws)
				}
				return
			default:
				console.warn("Unused message received")
		}
	})

	ws.on('close', () => {
		const assembly = Assembly.getAssemblyByClientId(request.session.id)
		if (assembly) {
			console.log(`Close: ${assembly.sessions.get(request.session.id).identity.name} closed socket`)
			assembly.updateClients()
		}
	})
	ws.on('error', () => {
		const assembly = Assembly.getAssemblyByClientId(request.session.id)
		if (assembly) {
			console.log(`Error: ${assembly.sessions.get(request.session.id).identity.name} closed socket`)
			assembly.updateClients()
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
