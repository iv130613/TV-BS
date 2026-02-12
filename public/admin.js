const token = localStorage.getItem('adminToken');
if (!token) {
    window.location.href = '/login';
}

const socket = io('/', {
    auth: { token }
});
const localVideo = document.getElementById('local-video');
const connectionStatus = document.getElementById('connection-status');
const viewerCountSpan = document.getElementById('viewer-count');

// PeerJS - Admin
const myPeer = new Peer(undefined, {
    host: '/',
    port: 3000,
    path: '/peerjs'
});

let myStream;
const peers = {}; // Guardar conexiones
let currentRoom = 'sala-principal';
let myPeerId = null;

// Al abrir conexión PeerJS
myPeer.on('open', id => {
    console.log('Admin Peer ID:', id);
    myPeerId = id;
    joinRoom(currentRoom);
});

// Listener para cambio de canal en UI
document.getElementById('channel-select').addEventListener('change', (e) => {
    currentRoom = e.target.value;
    console.log("Cambiando transmisión a:", currentRoom);
    joinRoom(currentRoom);
    // Si ya estamos transmitiendo, deberíamos quizás reiniciar la llamada a los nuevos usuarios?
    // Por simplicidad, el Admin debe estar en la sala antes de que los usuarios conecten, 
    // o al unirse a la nueva sala, esperar 'user-connected'.
});

function joinRoom(roomId) {
    if (myPeerId) {
        socket.emit('join-room', roomId, myPeerId);
    }
}

// Sockets
socket.on('user-connected', userId => {
    console.log('Usuario conectado:', userId);
    // Si ya estamos transmitiendo, llamar al nuevo usuario
    if (myStream) {
        connectToNewUser(userId, myStream);
    }
});

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close();
});

socket.on('update-viewer-count', count => {
    viewerCountSpan.innerText = count;
});

// Funciones de Media (Cámara/Pantalla)
async function startStreaming() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        myStream = stream;
        addVideoStream(localVideo, stream);
        connectionStatus.innerText = "Transmisión Activa 🔴";

        // Aquí deberíamos llamar a todos los usuarios que ya estén conectados si no es automático al entrar
        // Por simplicidad, el flujo actual confía en 'user-connected' para nuevos, 
        // y para los existentes se requeriría una lista de usuarios del server o reconexión manual.

    } catch (err) {
        console.error("Error al acceder a media:", err);
        alert("No se pudo acceder a cámara/micrófono");
    }
}

// Cambiar a Cámara
async function toggleCamera() {
    // Implementación básica: detener tracks y reiniciar getUserMedia
    // O simplemente mutear video track
    if (myStream) {
        const videoTrack = myStream.getVideoTracks()[0];
        videoTrack.enabled = !videoTrack.enabled;
    }
}

// Compartir Pantalla
async function shareScreen() {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true // Si se quiere audio del sistema
        });

        // Reemplazar tracks o stream completo
        // Simplificación: Reemplazar el stream local y las llamadas activas
        // Nota: PeerJS 'replaceTrack' es lo ideal, pero aquí reiniciaremos para demo simple

        const videoTrack = screenStream.getVideoTracks()[0];

        // Al detener pantalla, volver a cámara (opcional)
        videoTrack.onended = () => {
            // Volver a cámara... logic here
        };

        if (myPeer) {
            // Reemplazar track en todas las conexiones activas
            for (let userId in peers) {
                const sender = peers[userId].peerConnection.getSenders().find(s => s.track.kind === 'video');
                if (sender) {
                    sender.replaceTrack(videoTrack);
                }
            }
        }

        localVideo.srcObject = screenStream;

    } catch (err) {
        console.error("Error sharing screen:", err);
    }
}

// Micrófono
function toggleMic() {
    if (myStream) {
        const audioTrack = myStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
        }
    }
}

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    peers[userId] = call;

    call.on('close', () => {
        console.log("Llamada cerrada con", userId);
    });
}

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
}

// Chat Admin
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const messagesContainer = document.getElementById('messages');

chatForm.addEventListener('submit', e => {
    e.preventDefault();
    const msg = chatInput.value;
    if (msg.trim()) {
        socket.emit('chat-message', { user: 'ADMIN 👑', text: msg });
        chatInput.value = '';
    }
});

socket.on('chat-message', data => {
    addMessageToChat(data.user, data.text);
});

function addMessageToChat(user, text) {
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `<strong>${user}:</strong> ${text}`;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
