
import Assembly from '../assembly.js'

export async function post(req, res, next) {
    const assembly = await Assembly.create()

    const { name, email } = req.body

    assembly.join(req.session.id, { name, email })
    assembly.updateSession(req.session.id, { inLobby: true, isAdmin: true })

    // Create a assembly with this user as admin
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 201
    res.end(JSON.stringify({ assemblyId: assembly.id }));
}