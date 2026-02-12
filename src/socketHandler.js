module.exports = (io) => {
    let viewerCount = 0;

    io.on('connection', (socket) => {
        // Incrementar contador de viewers (si no es admin)
        // Simplificación: asumimos que todos son viewers al conectar excepto si se identifican diferente
        viewerCount++;
        io.emit('update-viewer-count', viewerCount);

        console.log('Nuevo usuario conectado. Total:', viewerCount);

        // Unirse a una sala específica
        socket.on('join-room', (roomId, userId) => {
            // Salir de salas anteriores (excepto su propio socket id)
            for (const room of socket.rooms) {
                if (room !== socket.id) {
                    socket.leave(room);
                }
            }

            console.log(`Usuario ${userId} se unió a la sala ${roomId}`);
            socket.join(roomId);
            socket.to(roomId).emit('user-connected', userId);

            socket.on('disconnect', () => {
                socket.to(roomId).emit('user-disconnected', userId);
            });
        });

        // Chat
        socket.on('chat-message', (msg) => {
            io.emit('chat-message', msg); // Reenviar a todos
        });

        // Desconexión
        socket.on('disconnect', () => {
            viewerCount--;
            io.emit('update-viewer-count', viewerCount);
            console.log('Usuario desconectado. Total:', viewerCount);
        });
    });
};
