
import Assembly from '../assembly.js'

export async function post(req, res, next) {
    const { name, assemblyId } = req.body
    const assembly = Assembly.byId(assemblyId)

    assembly.join(req.session.id, { name })

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200
    res.end(JSON.stringify({ assemblyId: assembly.id }));
}