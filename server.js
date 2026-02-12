const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*"
    }
});
const { ExpressPeerServer } = require('peer');
const path = require('path');
const cors = require('cors');

// Configuración
const PORT = process.env.PORT || 3000;

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { verifyTokenSocket, SECRET_KEY } = require('./src/auth');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// PeerJS Server Integrado
const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: '/'
});

app.use('/peerjs', peerServer);

// Auth Simulado (En prod usar DB)
const ADMIN_USER = {
    username: process.env.ADMIN_USER || 'admin',
    passwordHash: bcrypt.hashSync(process.env.ADMIN_PASS || 'admin123', 8)
};

// Rutas API Auth
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USER.username && bcrypt.compareSync(password, ADMIN_USER.passwordHash)) {
        const token = jwt.sign({ role: 'admin' }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Credenciales inválidas' });
    }
});

// Rutas Vistas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/admin', (req, res) => {
    // Nota: La protección real debería ser validar token antes de servir, o que el HTML valide y redirija.
    // Servimos el HTML y dejamos que el JS del cliente valide el localStorage
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Importar lógica de Sockets
const socketHandler = require('./src/socketHandler');
socketHandler(io);

// Iniciar servidor
server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`PeerJS server corriendo en /peerjs`);
});
