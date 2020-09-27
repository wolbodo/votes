
import Assembly from '../assembly.js'

const wait = (millis) => new Promise(resolve => setTimeout(() => resolve, millis))

export async function post(req, res, next) {
    const assembly = await Assembly.create()

    console.log("Assembly:", assembly)
    assembly.join(req.session.id)
    assembly.setAdmin(req.session.id)

    // Create a assembly with this user as admin
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 201
    res.end(JSON.stringify({ assemblyId: assembly.id }));
}