import crypto from 'crypto'

// Asynchronous
const random = (size) => new Promise((resolve, reject) => {
    crypto.randomBytes(size, (err, buf) => {
        if (err) reject(err)
        resolve(buf.toString('hex'));
    })
})

const wait = (millis) => new Promise(resolve => setTimeout(() => resolve, millis))
const randomString = (length = 6) => Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, length)

export async function post(req, res, next) {
    const meetingId = await random(4)
    req.session.data = {
        ...req.session.data || {},
        admin: true,
        meetingId
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 201
    res.end(JSON.stringify({ meetingId }));
}