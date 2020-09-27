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
    }

    join(clientId, identity) {
        console.log("Got id:", identity)
        this.sessions.set(clientId, {
            identity
        })
        Assembly.clientAssemblies.set(clientId, this)
        this.updateClients()
    }
    joinSocket(clientId, socket) {
        const session = this.sessions.get(clientId)
        this.sessions.set(clientId, {
            ...session,
            socket
        })
        this.updateClients()
    }
    
    setAdmin(clientId, isAdmin = true) {
        const session = this.sessions.get(clientId)
        
        this.sessions.set(clientId, {
            ...session,
            isAdmin
        })
        this.updateClients()
    }

    updateClients() {
        if (!this.__willUpdateClients) {
            this.__willUpdateClients = setTimeout(() => {
                const sessions = [...this.sessions.values()]
                const clients = sessions.map(({ identity, socket }) => ({
                    name: identity.name,
                    socket: socket && socket.readyState
                }))
                const msg = JSON.stringify({
                    type: 'clientList',
                    data: clients
                })
                sessions
                    .filter(({ socket }) => !!socket)
                    .forEach(({ socket }) => socket.send(msg))

                delete this.__willUpdateClients
            }, 10)
        }
    }
}