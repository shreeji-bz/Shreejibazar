import 'dotenv/config';
import http from 'http';
import app from './app';
import { config } from './config/app.config';

const server = http.createServer(app);

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
  console.log(`API: http://localhost:${config.port}/api/v1`);
});
