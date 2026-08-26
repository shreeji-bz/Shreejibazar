import { useEffect, useState } from 'react';
import { getSettings, updateSetting } from '../../services/authService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

interface Setting { key: string; value: string; type: string; }

export const Settings = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const load = () => getSettings().then((data: any) => { if (data.success) setSettings(data.data); });
  useEffect(() => { load(); }, []);

  const handleUpdate = async (key: string) => { await updateSetting(key, editValue); setEditingKey(null); load(); };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {settings.map((s) => (
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
