import './loadEnv.js';

import { createServer } from 'http';

import app from './app.js';
import { startSchedulers } from './jobs/scheduler.js';

const port = Number(process.env.PORT) || 4000;

const server = createServer(app);

server.on('listening', () => {
  console.log(`API server listening on http://localhost:${port}`);
});

server.on('error', (error) => {
  console.error('HTTP server error', error);
  process.exit(1);
});

server.listen(port);

startSchedulers();
