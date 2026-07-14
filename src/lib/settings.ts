import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';

const SETTINGS_PATH = path.resolve('src/content/settings/config.json');
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function getEncryptionKey(): string {
  return process.env.SETTINGS_ENCRYPTION_KEY || '';
}

function deriveKey(secret: string): Buffer {
  return crypto.scryptSync(secret, 'tourup-settings-salt', KEY_LENGTH);
}

function encryptValue(plaintext: string): string {
  if (!plaintext) return '';
  const key = deriveKey(getEncryptionKey());
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf-8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

function decryptValue(encoded: string): string {
  const encKey = getEncryptionKey();
  if (!encoded || !encKey) return '';
  try {
    const buf = Buffer.from(encoded, 'base64');
    const iv = buf.subarray(0, IV_LENGTH);
    const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const data = buf.subarray(IV_LENGTH + TAG_LENGTH);
    const key = deriveKey(encKey);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    return decipher.update(data) + decipher.final('utf-8');
  } catch {
    return '';
  }
}

const CRM_MASK = '********';

export interface SeoSettings {
  siteTitle: string;
  description: string;
  ogImage: string;
  canonicalUrl: string;
  metaKeywords: string;
}

export interface AdvancedSettings {
  customCss: string;
  customJsHead: string;
  customJsBody: string;
  inlineStyles: string;
  robotsTxt: string;
}

export interface IntegrationsSettings {
  googleAnalyticsId: string;
  facebookPixelId: string;
  crmUrl: string;
  crmApiKey: string;
  crmEnabled: boolean;
}

export interface Settings {
  seo: SeoSettings;
  advanced: AdvancedSettings;
  integrations: IntegrationsSettings;
}

const DEFAULTS: Settings = {
  seo: {
    siteTitle: 'TourUp',
    description: 'Peru travel directory and AI-optimized tourism platform',
    ogImage: '',
    canonicalUrl: 'https://tourup.co',
    metaKeywords: 'peru, travel, tourism, tours',
  },
  advanced: {
    customCss: '',
    customJsHead: '',
    customJsBody: '',
    inlineStyles: '',
    robotsTxt: 'User-agent: *\nAllow: /\n\nSitemap: https://tourup.co/sitemap.xml',
  },
  integrations: {
    googleAnalyticsId: '',
    facebookPixelId: '',
    crmUrl: '',
    crmApiKey: '',
    crmEnabled: false,
  },
};

let _cache: Settings | null = null;

export async function getSettings(): Promise<Settings> {
  if (_cache) return _cache;
  try {
    const raw = await fs.readFile(SETTINGS_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    _cache = { ...DEFAULTS, ...parsed };
    return _cache!;
  } catch {
    _cache = { ...DEFAULTS };
    return _cache;
  }
}

export async function updateSettings(partial: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const merged = mergeDeep(current, partial);

  if (merged.integrations?.crmApiKey) {
    if (merged.integrations.crmApiKey !== CRM_MASK) {
      merged.integrations.crmApiKey = encryptValue(merged.integrations.crmApiKey);
    } else {
      merged.integrations.crmApiKey = current.integrations?.crmApiKey || '';
    }
  }

  const tmpPath = path.join(os.tmpdir(), `settings-${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`);
  await fs.writeFile(tmpPath, JSON.stringify(merged, null, 2), 'utf-8');
  await fs.rename(tmpPath, SETTINGS_PATH);
  _cache = merged;

  const safe = maskCrmKey(merged);
  return safe;
}

export function getDecryptedCrmApiKey(settings: Settings): string {
  if (!settings.integrations?.crmApiKey) return '';
  return decryptValue(settings.integrations.crmApiKey);
}

function maskCrmKey(settings: Settings): Settings {
  if (settings.integrations?.crmApiKey && settings.integrations.crmApiKey !== CRM_MASK) {
    return {
      ...settings,
      integrations: { ...settings.integrations, crmApiKey: CRM_MASK },
    };
  }
  return settings;
}

export async function getSettingsMasked(): Promise<Settings> {
  const s = await getSettings();
  return maskCrmKey(s);
}

function mergeDeep(target: any, source: any): any {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = mergeDeep(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
