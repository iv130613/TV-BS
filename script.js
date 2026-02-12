let mediaStream = null;

function changeChannel(channelName, videoId) {
    // Stop any active broadcast first
    if (mediaStream) {
        stopBroadcast();
    }

    // Update the iframe source
    const iframe = document.getElementById('tvScreen');
    const screenFrame = document.querySelector('.screen-frame');

    // Ensure iframe is visible and video is removed if exists
    let videoElement = document.getElementById('liveVideo');
    if (videoElement) {
        videoElement.remove();
    }
    iframe.style.display = 'block';

    const newSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    iframe.src = newSrc;

    // Update current channel name display
    const currentChannelDisplay = document.getElementById('currentChannelName');
    currentChannelDisplay.textContent = `Viendo: ${channelName}`;

    // Update active button state
    const buttons = document.querySelectorAll('.channel-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        // Check if this button corresponds to the clicked channel
        const nameSpan = btn.querySelector('.channel-name');
        if (nameSpan && nameSpan.textContent === channelName) {
            btn.classList.add('active');
        }
    });

    console.log(`Changed channel to: ${channelName}`);
}

// Admin Modal Logic
function toggleAdminModal() {
    const modal = document.getElementById('adminModal');
    modal.classList.toggle('hidden');
}

function adminLogin() {
    const pass = document.getElementById('adminPass').value;
    if (pass === 'admin123') { // Simple password for demo
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('adminControls').classList.remove('hidden');
    } else {
        alert('Contraseña incorrecta');
    }
}

async function startBroadcast() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        mediaStream = stream;

        const screenFrame = document.querySelector('.screen-frame');
        const iframe = document.getElementById('tvScreen');

        // Hide iframe
        iframe.style.display = 'none';

        // Create or get video element
        let video = document.getElementById('liveVideo');
        if (!video) {
            video = document.createElement('video');
            video.id = 'liveVideo';
            video.autoplay = true;
            video.playsInline = true;
            screenFrame.appendChild(video);
        }

        video.srcObject = stream;

        // Update UI
        document.getElementById('currentChannelName').textContent = '🔴 TRANSMISIÓN EN VIVO (Admin)';

        // Close modal
        toggleAdminModal();

    } catch (err) {
        console.error("Error accessing webcam:", err);
        alert("No se pudo acceder a la cámara/micrófono. Asegúrate de dar permisos.");
    }
}

function stopBroadcast() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }

    // Remove video element
    const video = document.getElementById('liveVideo');
    if (video) {
        video.remove();
    }

    // Show iframe and return to default channel (News)
    const iframe = document.getElementById('tvScreen');
    iframe.style.display = 'block';
    changeChannel('Noticias', 'vMiOICestsI');
}

// Set initial active state correctly on load
document.addEventListener('DOMContentLoaded', () => {
    // Optionally default to the first channel
    console.log('TV App Initialized');
});
