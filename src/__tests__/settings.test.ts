import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getSettings, getSettingsMasked, getDecryptedCrmApiKey, updateSettings } from '../lib/settings';

process.env.SETTINGS_ENCRYPTION_KEY = 'test-encryption-key-for-settings-tests!';

const TEST_SETTINGS_PATH = path.resolve('src/content/settings/config.json');

describe('Settings', () => {
  beforeEach(async () => {
    try { await fs.unlink(TEST_SETTINGS_PATH); } catch {}
  });

  afterEach(async () => {
    try { await fs.unlink(TEST_SETTINGS_PATH); } catch {}
  });

  it('returns defaults when no file exists', async () => {
    const s = await getSettings();
    expect(s.seo.siteTitle).toBe('TourUp');
    expect(s.advanced.robotsTxt).toContain('User-agent: *');
    expect(s.integrations.crmEnabled).toBe(false);
  });

  it('persists updates to SEO settings', async () => {
    await updateSettings({
      seo: { siteTitle: 'Test Site', description: 'Test desc' },
    });
    const s = await getSettings();
    expect(s.seo.siteTitle).toBe('Test Site');
    expect(s.seo.description).toBe('Test desc');
  });

  it('merges partial updates', async () => {
    await updateSettings({
      advanced: { customCss: 'body { color: red; }' },
    });
    await updateSettings({
      integrations: { crmEnabled: true, crmUrl: 'https://crm.example.com' },
    });
    const s = await getSettings();
    expect(s.advanced.customCss).toBe('body { color: red; }');
    expect(s.integrations.crmEnabled).toBe(true);
    expect(s.integrations.crmUrl).toBe('https://crm.example.com');
  });

  it('round-trips all settings fields with encrypted crmApiKey', async () => {
    const full: any = {
      seo: { siteTitle: 'Full', description: 'Full desc', ogImage: 'https://img.com/og.jpg', canonicalUrl: 'https://example.com', metaKeywords: 'a, b, c' },
      advanced: { customCss: 'a', customJsHead: 'b', customJsBody: 'c', inlineStyles: 'd', robotsTxt: 'User-agent: Googlebot\nDisallow: /admin' },
      integrations: { googleAnalyticsId: 'G-ABC123', facebookPixelId: '12345', crmUrl: 'https://crm.x.com', crmApiKey: 'secret-key', crmEnabled: true },
    };
    await updateSettings(full);
    const s = await getSettings();
    expect(s.seo).toEqual(full.seo);
    expect(s.advanced).toEqual(full.advanced);
    expect(s.integrations.crmUrl).toBe(full.integrations.crmUrl);
    expect(s.integrations.crmEnabled).toBe(true);
  });

  it('masks crmApiKey in getSettings', async () => {
    await updateSettings({
      integrations: { crmApiKey: 'super-secret-key' },
    });
    const s = await getSettings();
    expect(s.integrations.crmApiKey).not.toBe('super-secret-key');
  });

  it('returns masked crmApiKey via getSettingsMasked', async () => {
    await updateSettings({
      integrations: { crmApiKey: 'my-api-key' },
    });
    const s = await getSettingsMasked();
    expect(s.integrations.crmApiKey).toBe('********');
  });

  it('decrypts crmApiKey with getDecryptedCrmApiKey', async () => {
    await updateSettings({
      integrations: { crmApiKey: 'my-api-key-123' },
    });
    const s = await getSettings();
    const decrypted = getDecryptedCrmApiKey(s);
    expect(decrypted).toBe('my-api-key-123');
  });

  it('handles empty updates gracefully', async () => {
    const before = await getSettings();
    await updateSettings({});
    const after = await getSettings();
    expect(after.seo).toEqual(before.seo);
  });
});
