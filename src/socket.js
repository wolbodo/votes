import { stores, goto } from '@sapper/app'
import { readable, get} from 'svelte/store'

export default () => {
  const { page } = stores();
  const id = get(page).params.assemblyId
  let clearError

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
    clearError = () => set({ error: null })

    const handlers = {
      clientInfo({ data: info }) {
        set({ info })
      },
      assemblyData({ data: { state, clients, poll, previousPolls} }) {
        set({ 
          clients,
          poll,
          state,
          previousPolls
        })
      },
      requestIdentity() {
        goto(`a-${id}/welcome`)
      },
      kicked() {
        goto('/kicked')
      },
      error( { data: { name, message }}) {
        console.log("Had error:", name, message)
        set({ error: message })
      }
    }
    ws.addEventListener('message', event => {
      const { data, type} = JSON.parse(event.data);
      console.log("ws:message", type, data)

      const handler = handlers[type] || (() => console.warn("Unknown message received", type))
      handler({ type, data })
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
    setPollInfo(subject) {
      send('setPollInfo', { subject })
    },
    addPollOption(option) {
      send('addPollOption', { option })
    },
    removePollOption(option) {
      send('removePollOption', { option })
    },
    startPoll() {
      send('startPoll')
    },
    clearError() {
      clearError && clearError()
    },
    castVote(vote) {
      send('castVote', { vote })
    },
    endPoll() {
      send('endPoll')
    }
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
