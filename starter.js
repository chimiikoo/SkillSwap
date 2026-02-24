import { spawn } from 'child_process';
import { createWriteStream } from 'fs';

const log = createWriteStream('server_debug.log');
const child = spawn('node', ['server/index.js'], {
    stdio: ['ignore', 'pipe', 'pipe']
});

child.stdout.pipe(log);
child.stderr.pipe(log);

child.on('error', (err) => {
    log.write(`Failed to start child process: ${err}\n`);
});

child.on('exit', (code, signal) => {
    log.write(`Child process exited with code ${code} and signal ${signal}\n`);
});

console.log('Starter script running...');
setTimeout(() => process.exit(0), 5000);
