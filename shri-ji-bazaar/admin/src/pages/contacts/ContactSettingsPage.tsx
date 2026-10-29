import { useEffect, useState } from 'react';
import { Loader2, MessageCircle } from 'lucide-react';
import { appsettingsService } from '../../services/appsettings.service';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

const CONTACT_FIELDS = [
  { key: 'contact.whatsapp', label: 'WhatsApp', type: 'text', placeholder: 'e.g. +91 98765 43210' },
  { key: 'contact.telegram', label: 'Telegram', type: 'text', placeholder: 'e.g. @shrijibazaar' },
  { key: 'contact.email', label: 'Email', type: 'email', placeholder: 'support@shrijibazaar.com' },
  { key: 'contact.support_url', label: 'Support URL', type: 'text', placeholder: 'https://shrijibazaar.com/support' },
];

export const ContactSettingsPage = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setValues(await appsettingsService.getContactSettings());
    } catch (e: any) {
      setError(e?.message || 'Failed to load contact settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (key: string) => {
    setSavingKey(key);
    setSavedKey(null);
    try {
      await appsettingsService.saveContactSetting(key, values[key] ?? '');
      setSavedKey(key);
    } catch (e: any) {
      setError(e?.message || 'Failed to save contact setting');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle size={22} className="text-gold-bright" />
        <h1 className="text-2xl font-bold text-text-primary">Contact Settings</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error text-error text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gold-bright" />
          <span className="ml-3 text-text-secondary">Loading contact settings...</span>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {CONTACT_FIELDS.map(({ key, label, type, placeholder }) => (
            <div key={key} className="p-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <p className="text-text-primary font-medium mb-0.5">{label}</p>
                <p className="text-text-muted text-xs mb-2">{key}</p>
                <Input
                  type={type}
                  value={values[key] ?? ''}
                  onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                />
              </div>
              <div className="flex sm:flex-col items-center sm:items-end gap-2">
                <Button onClick={() => handleSave(key)} disabled={savingKey !== null}>
                  {savingKey === key ? 'Saving...' : 'Save'}
                </Button>
                {savedKey === key && <span className="text-xs text-success">Saved</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactSettingsPage;
