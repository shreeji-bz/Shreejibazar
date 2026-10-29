import { fetchSettings, updateSettings } from './settings.service';

const APP_IMAGE_KEYS = ['app.image_banner', 'app.image_splash', 'app.image_header'];
const APK_KEYS = ['app.apk_url', 'app.apk_version', 'app.apk_changelog'];
const VIDEO_KEYS = ['app.video_url'];
const CONTACT_KEYS = ['contact.whatsapp', 'contact.telegram', 'contact.email', 'contact.support_url'];

type SettingValue = Record<string, string>;

/**
 * GET /v1/admin/settings returns either { data: [{ key, value }] } or { data: { key: value } }.
 * Normalizes to a Record<key, string> and picks out the requested keys (missing keys default to '').
 */
async function readKeys(keys: string[]): Promise<SettingValue> {
  const res: any = await fetchSettings();
  const raw: any = res?.data ?? res;
  const out: SettingValue = {};
  if (Array.isArray(raw)) {
    raw.forEach((row: any) => {
      if (row?.key !== undefined) out[row.key] = String(row.value ?? '');
    });
  } else if (raw && typeof raw === 'object') {
    Object.entries(raw).forEach(([k, v]) => {
      out[k] = String(v ?? '');
    });
  }
  keys.forEach((k) => {
    if (!(k in out)) out[k] = '';
  });
  return out;
}

async function saveKey(key: string, value: string): Promise<void> {
  await updateSettings({ [key]: value });
}

export const appsettingsService = {
  getMediaSettings() {
    return readKeys(APP_IMAGE_KEYS);
  },
  saveMediaSetting(key: string, value: string) {
    if (!APP_IMAGE_KEYS.includes(key)) throw new Error(`Unknown media setting key: ${key}`);
    return saveKey(key, value);
  },

  getApkSettings() {
    return readKeys(APK_KEYS);
  },
  saveApkSetting(key: string, value: string) {
    if (!APK_KEYS.includes(key)) throw new Error(`Unknown APK setting key: ${key}`);
    return saveKey(key, value);
  },

  getVideoSettings() {
    return readKeys(VIDEO_KEYS);
  },
  saveVideoSetting(key: string, value: string) {
    if (!VIDEO_KEYS.includes(key)) throw new Error(`Unknown video setting key: ${key}`);
    return saveKey(key, value);
  },

  getContactSettings() {
    return readKeys(CONTACT_KEYS);
  },
  saveContactSetting(key: string, value: string) {
    if (!CONTACT_KEYS.includes(key)) throw new Error(`Unknown contact setting key: ${key}`);
    return saveKey(key, value);
  },
};
