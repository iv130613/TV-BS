let mediaStream = null;

function changeChannel(channelName, videoId) {
    if (mediaStream) {
        stopBroadcast(false);
    }

    const iframe = document.getElementById('tvScreen');
    const screenFrame = document.querySelector('.screen-frame');

    let videoElement = document.getElementById('liveVideo');
    if (videoElement) {
        videoElement.remove();
    }
    iframe.style.display = 'block';

    const newSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    iframe.src = newSrc;

    const currentChannelDisplay = document.getElementById('currentChannelName');
    currentChannelDisplay.textContent = `Viendo: ${channelName}`;

    const buttons = document.querySelectorAll('.channel-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');

        const nameSpan = btn.querySelector('.channel-name');
        if (nameSpan && nameSpan.textContent === channelName) {
            btn.classList.add('active');
        }
    });

    console.log(`Changed channel to: ${channelName}`);
}

function toggleAdminModal() {
    const modal = document.getElementById('adminModal');
    modal.classList.toggle('hidden');
}

function adminLogin() {
    const pass = document.getElementById('adminPass').value;
    if (pass === 'admin123') {
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

        // Stop the YouTube video audio by clearing the source
        iframe.src = "";
        iframe.style.display = 'none';

        let video = document.getElementById('liveVideo');
        if (!video) {
            video = document.createElement('video');
            video.id = 'liveVideo';
            video.autoplay = true;
            video.playsInline = true;
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            video.style.position = 'absolute'; // Ensure it sits on top if needed
            video.style.top = '0';
            video.style.left = '0';
            video.style.zIndex = '10'; // Ensure it is above the iframe
            screenFrame.appendChild(video);
        }

        video.srcObject = stream;
        video.muted = true; // Mute local playback to avoid feedback loop
        video.volume = 0;

        try {
            await video.play();
        } catch (e) {
            console.error("Autoplay failed:", e);
        }

        document.getElementById('currentChannelName').textContent = '🔴 TRANSMISIÓN EN VIVO';

        toggleAdminModal();

    } catch (err) {
        console.error("Error accessing webcam:", err);
        alert("No se pudo acceder a la cámara/micrófono. Asegúrate de dar permisos y que no esté en uso por otra aplicación.");
    }
}

function stopBroadcast(restoreChannel = true) {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }

    const video = document.getElementById('liveVideo');
    if (video) {
        video.remove();
    }

    const iframe = document.getElementById('tvScreen');
    iframe.style.display = 'block';

    // Restore a default channel or the last channel
    if (restoreChannel) {
        changeChannel('Noticias', 'vMiOICestsI');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('TV App Initialized');
});
