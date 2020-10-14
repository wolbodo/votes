import { stores, goto } from '@sapper/app'
import { readable, get} from 'svelte/store'

// Websocket stores

// setup websocket => {
//   mutations,
//   stores
// }


export default () => {
  
  const { page } = stores();
  const id = get(page).params.assemblyId

  const ws = process.browser && new WebSocket(
    `${
      window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    }//${
      window.location.host
    }/${
      id
    }`
  )

  const store = readable({
    state: null,
    info: {},
    clients: [],
    poll: {
      subject: '',
      options: []
    },
    previousPolls: [],
    error: null,
  }, _set => {
    if (!ws) return

    const set = (update) => _set({...get(store), ...update})
    const actions = {
      clientInfo({ data: info }) {
        set({ info })
      },
      assemblyData({ data: { state, clients, poll} }) {
        set({ 
          clients,
          poll,
          state
        })
      },
      requestIdentity() {
        goto(`a-${id}/welcome`)
      },
      kicked() {
        goto('/kicked')
      },
      error( { data: { message }}) {
        set({ error: message })
      }
    }
    ws.addEventListener('message', event => {
      const { data, type} = JSON.parse(event.data);
      console.log("ws:message", type, data)

      const action = actions[type] || (() => console.warn("Unknown message received", type))
      action({ type, data })
      
      if (type !== 'error') {
        set({ error: null })
      }
    })
    
    ws.addEventListener('open', () => {
      send('join')
    })
    ws.addEventListener('error', () => goto('/'))
  })
  
  const send = (type, data = {}) => {
    ws.send(JSON.stringify({
      type, data
    }))
  }

  return {
    id,
    store,

    setLobby(name, inLobby) {
      send('setLobby', { name, inLobby })
    },
    setAdmin(name, isAdmin) {
      send('setAdmin', { name, isAdmin})
    },
    identifyUser(name) {
      send('identifyUser', { name })
      send('join')
    },
  }
}

  
export const getSocketState = readyState => {
  return {
    [WebSocket.CONNECTING]: 'Connecting',
    [WebSocket.OPEN]: 'Open',
    [WebSocket.CLOSING]: 'Closing',
    [WebSocket.CLOSED]: 'Closed',
    [undefined]: 'Unknown'
  }[readyState]
}
