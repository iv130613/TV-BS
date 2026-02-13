const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Store current video state
let videoState = {
    source: '', // URL of the video
    isPlaying: false,
    currentTime: 0,
    lastUpdateTime: Date.now()
};

io.on('connection', (socket) => {
    console.log('A user connected');

    // Send current state to new user
    // Calculate estimated current time if playing
    let estimatedTime = videoState.currentTime;
    if (videoState.isPlaying) {
        const timeDiff = (Date.now() - videoState.lastUpdateTime) / 1000;
        estimatedTime += timeDiff;
    }

    socket.emit('sync', {
        ...videoState,
        currentTime: estimatedTime
    });

    // Admin controls
    socket.on('admin:source', (source) => {
        videoState.source = source;
        videoState.isPlaying = false;
        videoState.currentTime = 0;
        videoState.lastUpdateTime = Date.now();
        io.emit('sync', videoState);
    });

    socket.on('admin:play', (currentTime) => {
        videoState.isPlaying = true;
        videoState.currentTime = currentTime;
        videoState.lastUpdateTime = Date.now();
        io.emit('play', currentTime);
    });

    socket.on('admin:pause', (currentTime) => {
        videoState.isPlaying = false;
        videoState.currentTime = currentTime;
        videoState.lastUpdateTime = Date.now();
        io.emit('pause', currentTime);
    });

    socket.on('admin:seek', (currentTime) => {
        videoState.currentTime = currentTime;
        videoState.lastUpdateTime = Date.now();
        io.emit('seek', currentTime);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
