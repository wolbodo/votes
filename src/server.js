import http from 'http'
import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';
import WebSocket from 'ws'
import session from 'express-session'

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

const sessionParser = session({
	secret: 'keyboard cat',
	cookie: {},
	resave: true,
	saveUninitialized: true
})

const server = http.createServer()
const app = polka({ server }) // You can also use Express
  	.use(sessionParser)
	.use(
		compression({ threshold: 0 }),
		sirv('static', { dev }),
		sapper.middleware({
			session: (req) => ({
				id: req.session.id
			})
		})
	)


const wss = new WebSocket.Server({ noServer: true });

const clients = []

wss.on('connection', function connection(ws, request, client) {
	clients.push(ws)
  ws.on('message', function message(msg) {
	console.log(`Received message ${msg} from user ${client}`, request.session.id);
	
	clients.map(client => client.send(JSON.stringify({ msg: `We just got a message: ${msg}`})))
  });
});


server.on('upgrade', function upgrade(request, socket, head) {
  // This function is not defined on purpose. Implement it with your own logic.
	console.log("hiya")
  sessionParser(request, {}, () => {
	  console.log("Made session?", request.session.id)
    if (!request.session.id) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    console.log('Session is parsed!');

    wss.handleUpgrade(request, socket, head, function (ws) {
      wss.emit('connection', ws, request);
    });
  });
});



// const wss = new WebSocket.Server({
// 	server
// })


// const message_history = [{
// 	id: uuidv4(),
// 	timestamp: Date.now(),
// 	action: 'join',
// 	name: 'sapperchatbot'
// }, {
// 	id: uuidv4(),
// 	timestamp: Date.now(),
// 	action: 'message',
// 	name: 'sapperchatbot',
// 	content: 'hello world!'
// }];

// // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
// function uuidv4() {
// 	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
// 		const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
// 		return v.toString(16);
// 	});
// }

// function broadcast(data) {
// 	data.id = uuidv4();
// 	data.timestamp = Date.now();

// 	message_history.push(data);

// 	const json = JSON.stringify(data);

// 	wss.clients.forEach(client => {
// 		if (client.readyState === WebSocket.OPEN) {
// 			client.send(json);
// 		}
// 	});
// }

// function pickRandom(arr) {
// 	const i = ~~(Math.random() * arr.length);
// 	return arr[i];
// }

// wss.on('connection', (ws, req) => {
// 	console.log("Test", req.session)
// 	ws.send(JSON.stringify(message_history));

// 	let name;

// 	ws.on('close', () => {
// 		broadcast({
// 			action: 'message',
// 			name: 'sapperchatbot',
// 			content: `@${name} just left the server :(`
// 		});
// 	});

// 	ws.on('message', json => {
// 		const data = JSON.parse(json);

// 		if (data.action === 'join') {
// 			name = data.name;

// 			setTimeout(() => {
// 				const greeting = pickRandom([
// 					`oh hai @${name}!`,
// 					`@${name} is here! everybody look busy!`,
// 					`hey there @${name}`,
// 					`we were wondering when you'd show up @${name}`,
// 					` 👋 @${name}`
// 				]);

// 				broadcast({
// 					action: 'message',
// 					name: 'sapperchatbot',
// 					content: greeting
// 				});
// 			}, 1500 + Math.random() * 2000);
// 		}

// 		broadcast(data);
// 	});
// });

app.listen(PORT, err => {
	if (err) console.log('error', err);
});
