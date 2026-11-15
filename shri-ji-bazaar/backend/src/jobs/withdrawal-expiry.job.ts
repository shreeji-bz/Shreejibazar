import { PaymentsService } from '../modules/payments/services/payments.service';
import { PaymentsRepository } from '../modules/payments/repositories/payments.repository';

/**
 * Scheduled job: expire idle withdrawal requests.
 *
 * Every check interval the job expires every PENDING withdrawal whose request
 * is older than the configured admin response timeout (default 24h, editable
 * in settings as `withdrawal_admin_timeout_hours`). Expiry releases the
 * reserved amount back to the user's available balance, marks the request
 * 'expired', notifies the user, and writes an audit row.
 *
 * Runs in-process with the Express server (start it at boot). The admin
 * panel can also trigger a pass on demand via
 * POST /admin/payments/withdrawals/run-expiry, so an external cron can call
 * that endpoint instead if the process model changes. No admin-facing
 * reminder is sent anywhere — only the user-facing expiry notification.
 */

export function startWithdrawalExpiryJob(checkIntervalMs = 60_000): void {
  const service = new PaymentsService(new PaymentsRepository());

  const tick = async () => {
    try {
      const result = await service.runWithdrawalExpiry();
      if (result.expired > 0) {
        console.log(`[withdrawal-expiry] expired ${result.expired} idle withdrawal request(s)`);
      }
      if (result.skipped > 0 && result.reason) {
        console.error(`[withdrawal-expiry] skipped ${result.skipped}: ${result.reason}`);
      }
    } catch (error) {
      // Never crash the process over a single failed pass.
      console.error('[withdrawal-expiry] pass failed:', error);
    }
  };

  const timer = setInterval(tick, checkIntervalMs);
  // Let a plain `node` shutdown stay clean even while the timer is live.
  (timer as any).unref?.();

  console.log(`[withdrawal-expiry] job started (check every ${checkIntervalMs / 1000}s)`);
}
