const programa = require('commander');
const { version } = require('./package.json');
const { run } = require('./src');

programa
  .version(version)
  .option('-p, --port <number>', 'Port to run the server on', '3000')
  .option('-d, --debug', 'Enable debug mode')
  .parse(process.argv);

const options = programa.opts();
run(options);

function changeChannel(roomName) {
    // Desconectar de la sala anterior
    socket.disconnect();
    
    // Desactivar canal anterior
    document.querySelectorAll('.channel-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Activar canal nuevo
    event.target.closest('.channel-item').classList.add('active');
    
    // Actualizar título del canal
    const channelNames = {
        'sala-principal': { name: 'General', desc: 'Disfruta de la transmisión en alta calidad' },
        'sala-deportes': { name: 'Deportes', desc: 'Eventos deportivos en vivo' },
        'sala-cine': { name: 'Cine', desc: 'Películas y estrenos' },
        'sala-musica': { name: 'Música', desc: 'Música 24/7' }
    };
    
    const channel = channelNames[roomName];
    document.querySelector('.stream-info h2').innerText = channel.name;
    document.querySelector('.stream-info p').innerText = channel.desc;
    
    // Reconectar a la nueva sala
    const newSocket = io('/');
    newSocket.on('open', (id) => {
        newSocket.emit('join-room', roomName, id);
    });
}
