
import Assembly from '../assembly.js'

export async function post(req, res, next) {
    const { name, assemblyId } = req.body
    const assembly = Assembly.byId(assemblyId)

    if (assembly.getSessionIdByName(name)) {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 401
        res.end(JSON.stringify({ msg: "Name already in use" }));
    } else {
        assembly.join(req.session.id, { name })
        
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200
        res.end(JSON.stringify({ assemblyId: assembly.id }));
    }
}