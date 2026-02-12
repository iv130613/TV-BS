const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

const remoteVideo = document.getElementById('remote-video');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const offlinePlaceholder = document.getElementById('offline-placeholder');
const viewerCountSpan = document.getElementById('viewer-count');

// PeerJS - Conexión como receptor
const myPeer = new Peer(undefined, {
    host: '/',
    port: 3000,
    path: '/peerjs'
});

// Cuando recibimos una llamada (el stream del admin)
myPeer.on('call', call => {
    console.log('Recibiendo llamada del Admin...');
    call.answer();

    call.on('stream', userVideoStream => {
        console.log('Stream recibido');
        addVideoStream(remoteVideo, userVideoStream);
        setOnlineStatus(true);
    });

    call.on('close', () => {
        setOnlineStatus(false);
    });
});

myPeer.on('open', id => {
    console.log('Mi Peer ID:', id);
    socket.emit('join-room', 'sala-principal', id);
});

// Sockets - Eventos
socket.on('user-connected', userId => {
    console.log('Admin o User conectado:', userId);
});

socket.on('user-disconnected', userId => {
    console.log('Usuario desconectado:', userId);
});

socket.on('update-viewer-count', count => {
    viewerCountSpan.innerText = count;
});

// Chat
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const messagesContainer = document.getElementById('messages');

chatForm.addEventListener('submit', e => {
    e.preventDefault();
    const msg = chatInput.value;
    if (msg.trim()) {
        socket.emit('chat-message', { user: 'Espectador', text: msg });
        chatInput.value = '';
    }
});

socket.on('chat-message', data => {
    addMessageToChat(data.user, data.text);
});

// Funciones Auxiliares
function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    offlinePlaceholder.style.display = 'none';
}

function setOnlineStatus(isOnline) {
    if (isOnline) {
        statusDot.className = 'status-dot';
        statusText.innerText = 'EN VIVO';
        offlinePlaceholder.style.display = 'none';
    } else {
        statusDot.className = 'status-dot offline';
        statusText.innerText = 'Desconectado';
        offlinePlaceholder.style.display = 'flex';
    }
}

function addMessageToChat(user, text) {
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `<strong>${user}:</strong> ${text}`;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
