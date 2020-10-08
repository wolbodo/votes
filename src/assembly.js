import crypto from 'crypto'

// Asynchronous
const random = (size) => new Promise((resolve, reject) => {
    crypto.randomBytes(size, (err, buf) => {
        if (err) reject(err)
        resolve(buf.toString('hex'));
    })
})

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

        this.nextPoll = {}
    }

    join(clientId, identity) {
        console.log("Got id:", identity)
        this.sessions.set(clientId, {
            identity
        })
        Assembly.clientAssemblies.set(clientId, this)
        this.sendClientList()
        this.sendClientInfo(clientId)
    }
    joinSocket(clientId, socket) {
        const session = this.sessions.get(clientId)
        this.sessions.set(clientId, {
            ...session,
            socket
        })
        this.sendClientList()
        this.sendClientInfo(clientId)
    }
    
    // Poll mgmt
    setPollInfo({ subject }) {
        this.nextPoll = { ... this.nextPoll, subject }
        this.sendPollInfo()
    }

    addPollOption(option) {
        this.nextPoll = {
            ...this.nextPoll,
            options: [...new Set([ ...this.nextPoll.options || [], option ])]
        }
        this.sendPollInfo()
    }
    removePollOption(option) {
        this.nextPoll = {
            ...this.nextPoll,
            options: this.nextPoll.options.filter(opt => opt !== option)
        }
        this.sendPollInfo()   
    }
    startPoll() {
        this.currentPoll = this.nextPoll
        this.nextPoll = null
        this.sendPollInfo()
    }

    updateSession(clientId, update) {
        const session = this.sessions.get(clientId)
        
        this.sessions.set(clientId, {
            ...session,
            ...update
        })
        this.sendClientInfo(clientId)
        this.sendClientList()
        this.sendPollInfo()
    }
    removeSession(clientId) {
        const { socket } = this.sessions.get(clientId)
        this.sessions.delete(clientId)
        Assembly.clientAssemblies.delete(clientId)
        this.sendClientList()

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
        [...this.sessions.values()]
            .filter(session => !!session.socket && session.inLobby && filter(session))
            .forEach(({ socket }) => socket.send(msg))
    }

    sendClientList() {
        if (!this.__willUpdateClients) {
            this.__willUpdateClients = setTimeout(() => {
                const sessions = [...this.sessions.values()]
                const clients = sessions.map(({ identity, socket, ...rest }) => ({
                    name: identity.name,
                    socket: socket && socket.readyState,
                    ...rest
                }))
                const msg = JSON.stringify({
                    type: 'clientList',
                    data: clients
                })
                this.sendAll(msg)
                delete this.__willUpdateClients
            }, 10)
        }
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
    sendPollInfo() {
        if (!this.__willSendPollInfo) {
            this.__willSendPollInfo = setTimeout(() => {
                const msg = JSON.stringify({
                    type: 'pollInfo',
                    data: {
                        next: this.nextPoll,
                        current: this.currentPoll,
                        previous: this.polls
                    }
                })
                this.sendAll(msg)
                delete this.__willSendPollInfo
            }, 10)
        }
    }
}