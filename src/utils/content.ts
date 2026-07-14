import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const CONTENT_DIR = path.resolve('src/content');

export async function readEntry(collection: string, slug: string) {
  const filePath = path.join(CONTENT_DIR, collection, `${slug}.md`);
  const raw = await fs.readFile(filePath, 'utf-8');
  return matter(raw);
}

export async function createEntry(
  collection: string,
  slug: string,
  frontmatter: Record<string, unknown>,
  body = ''
) {
  const filePath = path.join(CONTENT_DIR, collection, `${slug}.md`);
  await fs.writeFile(filePath, matter.stringify(body, frontmatter), 'utf-8');
  return { slug, filePath };
}

export async function updateEntry(
  collection: string,
  slug: string,
  frontmatter: Partial<Record<string, unknown>>,
  body?: string
) {
  const existing = await readEntry(collection, slug);
  const merged = { ...existing.data, ...frontmatter };
  const filePath = path.join(CONTENT_DIR, collection, `${slug}.md`);
  await fs.writeFile(filePath, matter.stringify(body ?? existing.content, merged), 'utf-8');
}

export async function deleteEntry(collection: string, slug: string) {
  await fs.unlink(path.join(CONTENT_DIR, collection, `${slug}.md`));
}

export async function listEntries(collection: string) {
  const dir = path.join(CONTENT_DIR, collection);
  const files = await fs.readdir(dir);
  return files.filter(f => f.endsWith('.md')).map(f => f.replace('.md', ''));
}
