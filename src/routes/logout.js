export function get(req, res) {
    req.session.destroy()
    res.writeHead(302, {
        'Location': '/',
    });
    res.end()
}