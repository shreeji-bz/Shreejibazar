import { useEffect, useState } from 'react';
import { getSettings, updateSetting } from '../../services/authService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

interface Setting { key: string; value: string; type: string; }

const BONUS_KEYS = ['signup_bonus_points'];
const WITHDRAWAL_KEY = 'min_withdrawal_amount';

/** Admin-approved withdrawal module — all of these drive the user/admin UX. */
const WITHDRAWAL_TIMEOUT_KEY = 'withdrawal_admin_timeout_hours';
const WITHDRAWAL_NOTICE_KEY = 'withdrawal_pending_notice_delay_ms';
const MSG_KEYS = ['msg_withdrawal_pending', 'msg_withdrawal_approved', 'msg_withdrawal_rejected', 'msg_withdrawal_expired'] as const;
const MSG_LABELS: Record<string, string> = {
  msg_withdrawal_pending: 'Pending notice (shown to the user after the delay)',
  msg_withdrawal_approved: 'Approved message (use {amount} for the figure)',
  msg_withdrawal_rejected: 'Rejected message (use {amount} for the figure)',
  msg_withdrawal_expired: 'Expired message (use {amount} for the figure)',
};

export const Settings = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const load = () => getSettings().then((data: any) => { if (data.success) setSettings(data.data); });
  useEffect(() => { load(); }, []);

  const handleUpdate = async (key: string) => { await updateSetting(key, editValue); setEditingKey(null); load(); };

  const bonusPoints = settings.find((s) => s.key === 'signup_bonus_points')?.value || '0';
  const minWithdrawal = settings.find((s) => s.key === WITHDRAWAL_KEY)?.value || '100';

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="bg-card border border-border rounded-xl divide-y divide-border mb-8">
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="text-text-primary font-medium">Signup Bonus</p>
            <p className="text-text-muted text-sm">Points credited to new users on registration (0 = off)</p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              label=""
              type="number"
              min="0"
              className="w-28"
              value={bonusPoints}
              onChange={(e) => updateSetting('signup_bonus_points', e.target.value)}
              onBlur={() => load()}
            />
            <span className="text-text-muted text-sm">pts</span>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl divide-y divide-border mb-8">
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="text-text-primary font-medium">Minimum Withdrawal</p>
            <p className="text-text-muted text-sm">Minimum amount a user can request to withdraw</p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              label=""
              type="number"
              min="0"
              className="w-32"
              value={minWithdrawal}
              onChange={(e) => updateSetting(WITHDRAWAL_KEY, e.target.value)}
              onBlur={() => load()}
            />
            <span className="text-text-muted text-sm">INR</span>
          </div>
        </div>
      </div>

      {/* ---- Admin-approved withdrawals: response window + user-facing copy ---- */}
      <h2 className="text-lg font-semibold mb-4">Withdrawal Rules</h2>
      <div className="bg-card border border-border rounded-xl divide-y divide-border mb-8">
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="text-text-primary font-medium">Admin Response Timeout</p>
            <p className="text-text-muted text-sm">Pending requests idle this long are expired automatically and released</p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              label=""
              type="number"
              min="1"
              className="w-24"
              value={settings.find((s) => s.key === WITHDRAWAL_TIMEOUT_KEY)?.value || '24'}
              onChange={(e) => updateSetting(WITHDRAWAL_TIMEOUT_KEY, e.target.value)}
              onBlur={() => load()}
            />
            <span className="text-text-muted text-sm">hours</span>
          </div>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="text-text-primary font-medium">Pending Notice Delay</p>
            <p className="text-text-muted text-sm">After this delay the app tells the user their request is pending and safe</p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              label=""
              type="number"
              min="1000"
              className="w-28"
              value={settings.find((s) => s.key === WITHDRAWAL_NOTICE_KEY)?.value || '3500'}
              onChange={(e) => updateSetting(WITHDRAWAL_NOTICE_KEY, e.target.value)}
              onBlur={() => load()}
            />
            <span className="text-text-muted text-sm">ms</span>
          </div>
        </div>
        {MSG_KEYS.map((key) => (
          <div key={key} className="p-4">
            <p className="text-text-primary font-medium mb-1">{MSG_LABELS[key] || key}</p>
            <textarea
              rows={2}
              className="w-full px-3 py-2 bg-card-secondary border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-gold"
              value={settings.find((s) => s.key === key)?.value || ''}
              onChange={(e) => updateSetting(key, e.target.value)}
              onBlur={() => load()}
            />
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-4">All Settings</h2>
      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {settings
          .filter((s) => !BONUS_KEYS.includes(s.key))
          .filter((s) => ![WITHDRAWAL_TIMEOUT_KEY, WITHDRAWAL_NOTICE_KEY, ...MSG_KEYS].includes(s.key))
          .map((s) => (
          <div key={s.key} className="p-4 flex items-center justify-between">
            <div><p className="text-text-primary font-medium">{s.key}</p><p className="text-text-muted text-sm">{s.type}</p></div>
            {editingKey === s.key ? (
              <div className="flex gap-2"><Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-48" /><Button onClick={() => handleUpdate(s.key)}>Save</Button></div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">{s.value}</span>
                <Button variant="outline" onClick={() => { setEditingKey(s.key); setEditValue(s.value); }}>Edit</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
