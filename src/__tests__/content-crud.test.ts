import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createEntry, readEntry, updateEntry, deleteEntry, listEntries } from '../utils/content';

const TEST_COLLECTION = '__test_collection';
const TEST_DIR = path.resolve(`src/content/${TEST_COLLECTION}`);

describe('Content CRUD', () => {
  beforeEach(async () => {
    try { await fs.mkdir(TEST_DIR, { recursive: true }); } catch {}
  });

  afterEach(async () => {
    try { await fs.rm(TEST_DIR, { recursive: true, force: true }); } catch {}
  });

  it('creates and reads an entry', async () => {
    await createEntry(TEST_COLLECTION, 'test-article', { title: 'Test', type: 'post' });
    const entry = await readEntry(TEST_COLLECTION, 'test-article');
    expect(entry.data.title).toBe('Test');
    expect(entry.data.type).toBe('post');
  });

  it('creates entry with body content', async () => {
    await createEntry(TEST_COLLECTION, 'with-body', { title: 'Body Test' }, 'This is the markdown body');
    const entry = await readEntry(TEST_COLLECTION, 'with-body');
    expect(entry.content.trim()).toBe('This is the markdown body');
  });

  it('updates an entry', async () => {
    await createEntry(TEST_COLLECTION, 'updatable', { title: 'Original', count: 1 });
    await updateEntry(TEST_COLLECTION, 'updatable', { title: 'Updated', count: 2 });
    const entry = await readEntry(TEST_COLLECTION, 'updatable');
    expect(entry.data.title).toBe('Updated');
    expect(entry.data.count).toBe(2);
  });

  it('deletes an entry', async () => {
    await createEntry(TEST_COLLECTION, 'deletable', { title: 'Delete me' });
    await deleteEntry(TEST_COLLECTION, 'deletable');
    await expect(readEntry(TEST_COLLECTION, 'deletable')).rejects.toThrow();
  });

  it('lists entries', async () => {
    await createEntry(TEST_COLLECTION, 'first', { title: 'First' });
    await createEntry(TEST_COLLECTION, 'second', { title: 'Second' });
    const slugs = await listEntries(TEST_COLLECTION);
    expect(slugs.sort()).toEqual(['first', 'second']);
  });

  it('returns empty list for empty collection', async () => {
    const slugs = await listEntries(TEST_COLLECTION);
    expect(slugs).toEqual([]);
  });

  it('preserves body content on update', async () => {
    await createEntry(TEST_COLLECTION, 'body-preserve', { title: 'Original' }, 'Body content here');
    await updateEntry(TEST_COLLECTION, 'body-preserve', { title: 'Updated' });
    const entry = await readEntry(TEST_COLLECTION, 'body-preserve');
    expect(entry.content.trim()).toBe('Body content here');
    expect(entry.data.title).toBe('Updated');
  });

  it('updates body content when provided', async () => {
    await createEntry(TEST_COLLECTION, 'body-update', { title: 'Original' }, 'Old body');
    await updateEntry(TEST_COLLECTION, 'body-update', { title: 'Updated' }, 'New body');
    const entry = await readEntry(TEST_COLLECTION, 'body-update');
    expect(entry.content.trim()).toBe('New body');
  });
});
