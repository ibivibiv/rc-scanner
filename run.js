'use strict';

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const clientPath = path.resolve(__dirname, 'client');
const serverPath = path.resolve(__dirname, 'server');

const missingModules = {
    client: !fs.existsSync(path.resolve(clientPath, 'node_modules')),
    server: !fs.existsSync(path.resolve(serverPath, 'node_modules')),
}

if (missingModules.client || missingModules.server) {
    process.stdout.write('Installing node modules...');

    if (missingModules.client) {
        childProcess.execSync('npm install', { cwd: clientPath, stdio: ['ignore', 'ignore', 'pipe'] });
    }

    if (missingModules.server) {
        childProcess.execSync('npm install', { cwd: serverPath, stdio: ['ignore', 'ignore', 'pipe'] });
    }

    process.stdout.write(' done\n');
}

if (!fs.existsSync(path.resolve(clientPath, 'dist/main.html'))) {
    process.stdout.write('Building client app...');
    childProcess.execSync('npm run build', { cwd: clientPath, stdio: ['ignore', 'ignore', 'pipe'] });
    process.stdout.write(' done\n');
}

const envFile = path.resolve(serverPath, '.env');

if (fs.existsSync(envFile)) {
    require(path.resolve(serverPath, 'node_modules/dotenv')).config({ path: envFile });

    childProcess.execSync('node index.js', { cwd: serverPath, stdio: 'inherit' });

} else {
    const { models } = require(path.resolve(serverPath, 'lib/rc-scanner/models'));

    const askModel = () => {
        
        model = models[0].name;
        const comPort = process.platform === 'win32' ? 'com1' : '/dev/ttyACM0';
        const data = [
            `NODE_ENV=production`,
            `NODE_HOST=0.0.0.0`,
            `NODE_PORT=3000`,
            ``,
            `RC_MODEL=${model}`,
            `RC_HIDE_SERIAL_NUMBER=false`,
            ``,
            `RC_AUDIO_DEVICE_ID=-1`,
            `RC_AUDIO_SAMPLE_RATE=44100`,
            `RC_AUDIO_SQUELCH=100`,
            ``,
            `RC_COM_BAUDRATE=115200`,
            `RC_COM_DATABITS=8`,
            `RC_COM_PARITY=none`,
            `RC_COM_PORT=${comPort}`,
            `RC_COM_RTSCTS=false`,
            `RC_COM_STOPBITS=1`,
            ``,
        ].join('\n');
        fs.writeFileSync(envFile, data);
        process.exit(0);

    }

    let model;

    askModel();
}
