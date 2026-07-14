import crypto from 'node:crypto';
import initSqlJs from 'sql.js';
import fs from 'node:fs';
import path from 'node:path';

const DB_PATH = path.resolve('tourup-cms.db');

let _db: Awaited<ReturnType<Awaited<ReturnType<typeof initSqlJs>>['Database']>> | null = null;

async function getDb() {
  if (_db) return _db;
  const SQL = await initSqlJs();
  try {
    const buffer = fs.readFileSync(DB_PATH);
    _db = new SQL.Database(buffer);
  } catch {
    _db = new SQL.Database();
  }
  _db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      hashed_password TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
  saveDb();
  return _db;
}

function saveDb() {
  if (!_db) return;
  const data = _db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

export interface User {
  id: string;
  username: string;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: number;
}

export async function createUser(username: string, password: string): Promise<User> {
  const db = await getDb();
  const id = crypto.randomUUID();
  const salt = crypto.randomBytes(16).toString('hex');
  const hashedPassword = crypto.scryptSync(password, salt, 64).toString('hex') + ':' + salt;

  db.run('INSERT INTO users (id, username, hashed_password) VALUES (?, ?, ?)', [id, username, hashedPassword]);
  saveDb();

  return { id, username };
}

export async function verifyPassword(username: string, password: string): Promise<User | null> {
  const db = await getDb();
  const stmt = db.prepare('SELECT id, username, hashed_password FROM users WHERE username = ?');
  stmt.bind([username]);

  let row: { id: string; username: string; hashed_password: string } | undefined;
  if (stmt.step()) {
    row = stmt.getAsObject() as { id: string; username: string; hashed_password: string };
  }
  stmt.free();

  if (!row) return null;

  const [hash, salt] = row.hashed_password.split(':');
  const verifyHash = crypto.scryptSync(password, salt, 64).toString('hex');

  if (hash === verifyHash) {
    return { id: row.id, username: row.username };
  }
  return null;
}

export async function createSession(userId: string): Promise<Session> {
  const db = await getDb();
  const id = crypto.randomUUID();
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;

  db.run('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)', [id, userId, expiresAt]);
  saveDb();

  return { id, userId, expiresAt };
}

export async function validateSession(sessionId: string): Promise<Session | null> {
  const db = await getDb();
  const stmt = db.prepare('SELECT id, user_id, expires_at FROM sessions WHERE id = ?');
  stmt.bind([sessionId]);

  let row: { id: string; user_id: string; expires_at: number } | undefined;
  if (stmt.step()) {
    row = stmt.getAsObject() as { id: string; user_id: string; expires_at: number };
  }
  stmt.free();

  if (!row) return null;

  const now = Math.floor(Date.now() / 1000);
  if (now >= row.expires_at) {
    db.run('DELETE FROM sessions WHERE id = ?', [sessionId]);
    saveDb();
    return null;
  }

  const newExpiresAt = now + 60 * 60 * 24 * 30;
  db.run('UPDATE sessions SET expires_at = ? WHERE id = ?', [newExpiresAt, sessionId]);
  saveDb();

  return { id: row.id, userId: row.user_id, expiresAt: row.expires_at };
}

export async function deleteSession(sessionId: string): Promise<void> {
  const db = await getDb();
  db.run('DELETE FROM sessions WHERE id = ?', [sessionId]);
  saveDb();
}

export async function deleteUserSessions(userId: string): Promise<void> {
  const db = await getDb();
  db.run('DELETE FROM sessions WHERE user_id = ?', [userId]);
  saveDb();
}

export async function getUserById(userId: string): Promise<User | null> {
  const db = await getDb();
  const stmt = db.prepare('SELECT id, username FROM users WHERE id = ?');
  stmt.bind([userId]);

  let row: { id: string; username: string } | undefined;
  if (stmt.step()) {
    row = stmt.getAsObject() as { id: string; username: string };
  }
  stmt.free();

  if (!row) return null;
  return { id: row.id, username: row.username };
}
