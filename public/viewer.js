const socket = io();

const videoPlayer = document.getElementById('tv-player');
const statusOverlay = document.querySelector('.status');
const muteBtn = document.getElementById('tap-to-unmute');

// Handle Autoplay restrictions
// Most browsers block autoplay with sound. We start muted.
videoPlayer.muted = true;

socket.on('connect', () => {
    console.log('Connected to TV Server');
});

socket.on('sync', (state) => {
    console.log('Sync received:', state);
    if (state.source) {
        const currentSrc = videoPlayer.currentSrc || videoPlayer.src;
        if (currentSrc !== state.source && !currentSrc.endsWith(state.source)) {
            videoPlayer.src = state.source;
        }
    }

    if (state.isPlaying) {
        const timeDiff = Math.abs(videoPlayer.currentTime - state.currentTime);
        if (timeDiff > 0.5) {
            videoPlayer.currentTime = state.currentTime;
        }
        videoPlayer.play().catch(handleAutoplayError);
    } else {
        videoPlayer.pause();
        videoPlayer.currentTime = state.currentTime;
    }
});

socket.on('play', (currentTime) => {
    console.log('Play event');
    const timeDiff = Math.abs(videoPlayer.currentTime - currentTime);
    if (timeDiff > 0.5) {
        videoPlayer.currentTime = currentTime;
    }
    videoPlayer.play().catch(handleAutoplayError);
});

socket.on('pause', (currentTime) => {
    console.log('Pause event');
    videoPlayer.pause();
    videoPlayer.currentTime = currentTime;
});

socket.on('seek', (currentTime) => {
    console.log('Seek event');
    videoPlayer.currentTime = currentTime;
});

function handleAutoplayError(error) {
    console.warn('Autoplay prevented:', error);
    muteBtn.style.display = 'block';
}

muteBtn.addEventListener('click', () => {
    videoPlayer.muted = false;
    muteBtn.style.display = 'none';
    if (!videoPlayer.paused) {
        videoPlayer.play();
    }
});
