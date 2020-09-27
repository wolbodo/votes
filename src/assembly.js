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
        this.admins = new Set()
        this.sessions = new Map()
    }

    join(clientId, connection) {
        this.sessions.set(clientId, connection)
        Assembly.clientAssemblies.set(clientId, this)
    }
    
    setAdmin(clientId) {
        this.admins.add(clientId)
    }
}