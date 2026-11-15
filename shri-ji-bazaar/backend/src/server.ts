import 'dotenv/config';
import http from 'http';
import app from './app';
import { config } from './config/app.config';
import { startWithdrawalExpiryJob } from './jobs/withdrawal-expiry.job';

const server = http.createServer(app);

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
  console.log(`API: http://localhost:${config.port}/api/v1`);

  // Admin-approved withdrawals: expire idle requests after the configured
  // response window (default 24h, settings: withdrawal_admin_timeout_hours).
  // Disable with env WITHDRAWAL_EXPIRY_DISABLED=1 if an external cron calls
  // POST /admin/payments/withdrawals/run-expiry instead.
  if (process.env.WITHDRAWAL_EXPIRY_DISABLED !== '1') {
    startWithdrawalExpiryJob(60_000);
  }
});
