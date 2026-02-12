const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'secreto_super_seguro_cambiar_en_prod';

// Middleware para verificar token en headers o cookies (aquí headers por simplicidad en API, o query param para WebSockets si fuera necesario)
// Para la vista admin.html, como es servida por el navegador, lo ideal es una cookie o un redirect si no hay auth.
// Simplificaremos: El endpoint /admin valida Basic Auth o redirige a /login. 
// O mejor: /admin serve el HTML, pero el HTML tiene JS que verifica token. Si no, redirige.
// Vamos a usar un enfoque de API: el HTML del admin es público, pero los sockets/peer requieren auth.

// En este caso, haremos que el socket handshake requiera token.
const verifyTokenSocket = (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error("Autenticación requerida"));
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        socket.user = decoded;
        next();
    } catch (err) {
        next(new Error("Token inválido"));
    }
};

const verifyTokenHttp = (req, res, next) => {
    // Implementación para rutas express si fuera necesario
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

module.exports = { verifyTokenSocket, verifyTokenHttp, SECRET_KEY };
