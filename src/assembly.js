import crypto from 'crypto'

// Asynchronous
const random = (size) => new Promise((resolve, reject) => {
    crypto.randomBytes(size, (err, buf) => {
        if (err) reject(err)
        resolve(buf.toString('hex'));
    })
})

class WaitError extends Error {}

export default class Assembly {
    static assemblies = new Map()
    static clientAssemblies = new Map()

    static async create () {
        const id = await random(4)
        const assembly = new Assembly(id)
        this.assemblies.set(id, assembly)

        return assembly
    }

    static getAssemblyByClientId (clientId) {
        return this.clientAssemblies.get(clientId)
    }

    static byId(assemblyId) {
        return this.assemblies.get(assemblyId)
    }

    constructor(id) {
        this.id = id
        this.sessions = new Map()
        this.state = 'lobby'
        this.poll = {}
    }

    // Lobby operations

    join(clientId, identity) {
        if (this.state !== 'lobby') throw new WaitError('Wait please')

        console.log("Got id:", identity)
        this.sessions.set(clientId, {
            identity
        })
        Assembly.clientAssemblies.set(clientId, this)
        this.sendAssemblyData()
        this.sendClientInfo(clientId)
    }
    joinSocket(clientId, socket) {
        const session = this.sessions.get(clientId)
        this.sessions.set(clientId, {
            ...session,
            socket
        })
        this.sendAssemblyData()
        this.sendClientInfo(clientId)
    }
    
    // Poll mgmt
    setPollInfo({ subject }) {
        if (this.state !== 'lobby') throw new WaitError('Wait please')

        this.poll = { ... this.poll, subject }
        this.sendAssemblyData()
    }

    addPollOption(option) {
        if (this.state !== 'lobby') throw new WaitError('Wait please')

        this.poll = {
            ...this.poll,
            options: [...new Set([ ...this.poll.options || [], option ])]
        }
        this.sendAssemblyData()
    }
    removePollOption(option) {
        if (this.state !== 'lobby') throw new WaitError('Wait please')

        this.poll = {
            ...this.poll,
            options: this.poll.options.filter(opt => opt !== option)
        }
        this.sendAssemblyData()   
    }
    startPoll() {
        if (this.state !== 'lobby') throw new WaitError('Wait please')

        if (!this.poll.subject || !(this.poll.options && this.poll.options.length))
            throw new Error('Poll not ready')

        this.state = 'polling'
        this.sendAssemblyData()
    }

    updateSession(clientId, update) {
        if (this.state !== 'lobby') throw new WaitError('Wait please')

        const session = this.sessions.get(clientId)
        
        this.sessions.set(clientId, {
            ...session,
            ...update
        })
        this.sendClientInfo(clientId)
        this.sendAssemblyData()
    }
    removeSession(clientId) {
        if (this.state !== 'lobby') throw new WaitError('Wait please')

        const { socket } = this.sessions.get(clientId)
        this.sessions.delete(clientId)
        Assembly.clientAssemblies.delete(clientId)
        this.sendAssemblyData()

        socket.send(JSON.stringify({
            type: 'kicked'
        }))
    }
    getSessionIdByName(name) {
        // Check whether name already in the session
        const iname = name.toLowerCase().replace(' ', '')
        const result = [...this.sessions.entries()]
            .find(([sessionId, { identity }]) => identity.name.toLowerCase().replace(' ', '') === iname)
        return result ? result[0] : undefined
    }

    sendAll(msg, filter = () => true) {
        const active = [...this.sessions.values()]
        .filter(session => !!session.socket && session.inLobby && filter(session))
        console.log('Sending to all:', active.map(({ identity: { name } }) => name), msg)
        
        active.forEach(({ socket }) => socket.send(msg))
    }

    sendClientInfo(clientId) {
        const { socket, identity, ...rest} = this.sessions.get(clientId)
        if (!socket) return

        const msg = JSON.stringify({
            type: 'clientInfo',
            data: {
                name: identity.name,
                ...rest
            }
        })
        socket.send(msg)
    }

    sendAssemblyData() {
        if (!this.__sendingAssemblyData) {
            this.__sendingAssemblyData = setTimeout(() => {
                const sessions = [...this.sessions.values()]
                const clients = sessions.map(({ identity, socket, ...rest }) => ({
                    name: identity.name,
                    socket: socket && socket.readyState,
                    ...rest
                }))
                const msg = JSON.stringify({
                    type: 'assemblyData',
                    data: {
                        state: this.state,
                        clients,
                        poll: this.poll,
                        polls: this.polls
                    }
                })
                this.sendAll(msg)
                delete this.__sendingAssemblyData
            }, 10)
        }
    }
}