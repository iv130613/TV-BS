const socket = io();

// Elements
const videoInput = document.getElementById('video-source');
const setSourceBtn = document.getElementById('set-source');
const adminPlayer = document.getElementById('admin-player');
const connectionStatus = document.getElementById('connection-status');
const viewerCount = document.getElementById('viewer-count'); // Placeholder for now

// Connection status
socket.on('connect', () => {
    connectionStatus.textContent = 'Conectado';
    connectionStatus.style.color = '#4caf50';
});

socket.on('disconnect', () => {
    connectionStatus.textContent = 'Desconectado';
    connectionStatus.style.color = '#f44336';
});

// Set Video Source
setSourceBtn.addEventListener('click', () => {
    const source = videoInput.value;
    if (source) {
        adminPlayer.src = source;
        socket.emit('admin:source', source);
    }
});

// Sync Play
adminPlayer.addEventListener('play', () => {
    socket.emit('admin:play', adminPlayer.currentTime);
});

// Sync Pause
adminPlayer.addEventListener('pause', () => {
    socket.emit('admin:pause', adminPlayer.currentTime);
});

// Sync Seek
adminPlayer.addEventListener('seeked', () => {
    // Only emit seek if not just purely playing (some browsers fire seek on play/pause)
    // For simplicity, we emit. Detailed logic might debounce.
    socket.emit('admin:seek', adminPlayer.currentTime);
});

// Receive sync to keep admin up to date if multiple admins (optional but good)
socket.on('sync', (state) => {
    // Only update if source is different to avoid reloading
    const currentSrc = adminPlayer.currentSrc || adminPlayer.src;
    if (state.source && currentSrc !== state.source && !currentSrc.endsWith(state.source)) {
        adminPlayer.src = state.source;
    }
});
