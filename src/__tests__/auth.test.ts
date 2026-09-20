import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRateLimiter } from '../lib/rate-limit';

describe('createRateLimiter', () => {
  it('permite hasta `max` intentos por ventana y bloquea el siguiente', () => {
    const rl = createRateLimiter(3, 1000, () => 0);
    expect([rl.hit('a'), rl.hit('a'), rl.hit('a'), rl.hit('a')]).toEqual([true, true, true, false]);
  });

  it('cuenta cada clave por separado', () => {
    const rl = createRateLimiter(1, 1000, () => 0);
    expect(rl.hit('a')).toBe(true);
    expect(rl.hit('a')).toBe(false);
    expect(rl.hit('b')).toBe(true);
  });

  it('se libera al terminar la ventana', () => {
    let t = 0;
    const rl = createRateLimiter(1, 1000, () => t);
    expect(rl.hit('a')).toBe(true);
    expect(rl.hit('a')).toBe(false);
    t = 1001;
    expect(rl.hit('a')).toBe(true);
  });

  it('reset() limpia el contador (login correcto)', () => {
    const rl = createRateLimiter(1, 1000, () => 0);
    rl.hit('a');
    rl.reset('a');
    expect(rl.hit('a')).toBe(true);
  });

  it('no crece sin límite con claves aleatorias', () => {
    const rl = createRateLimiter(1, 60_000, () => 0);
    for (let i = 0; i < 20_000; i++) rl.hit(`ip-${i}`);
    // Sigue funcionando y las claves recientes se recuerdan.
    expect(rl.hit('ip-19999')).toBe(false);
  });
});

describe('auth (base sql.js temporal)', () => {
  const dbPath = path.join(os.tmpdir(), `tourup-auth-test-${process.pid}.db`);
  let auth: typeof import('../lib/auth');

  beforeAll(async () => {
    process.env.CMS_DB_PATH = dbPath;
    auth = await import('../lib/auth');
    await auth.createUser('admin', 'correct horse battery staple');
  });

  afterAll(() => {
    delete process.env.CMS_DB_PATH;
    fs.rmSync(dbPath, { force: true });
  });

  it('acepta la contraseña correcta', async () => {
    const user = await auth.verifyPassword('admin', 'correct horse battery staple');
    expect(user?.username).toBe('admin');
  });

  it('rechaza contraseña incorrecta y usuario inexistente', async () => {
    expect(await auth.verifyPassword('admin', 'wrong')).toBeNull();
    expect(await auth.verifyPassword('nobody', 'correct horse battery staple')).toBeNull();
  });

  it('rechaza hashes almacenados malformados sin lanzar', async () => {
    const user = await auth.verifyPassword('admin', '');
    expect(user).toBeNull();
  });

  it('crea, valida y elimina sesiones', async () => {
    const user = await auth.verifyPassword('admin', 'correct horse battery staple');
    const session = await auth.createSession(user!.id);
    expect((await auth.validateSession(session.id))?.userId).toBe(user!.id);
    await auth.deleteSession(session.id);
    expect(await auth.validateSession(session.id)).toBeNull();
  });

  it('no reescribe la base en cada validación (sesión deslizante como mucho 1 vez al día)', async () => {
    const user = await auth.verifyPassword('admin', 'correct horse battery staple');
    const session = await auth.createSession(user!.id);
    const before = fs.statSync(dbPath).mtimeMs;
    await new Promise((r) => setTimeout(r, 20));
    const a = await auth.validateSession(session.id);
    const b = await auth.validateSession(session.id);
    expect(a?.expiresAt).toBe(session.expiresAt);
    expect(b?.expiresAt).toBe(session.expiresAt);
    expect(fs.statSync(dbPath).mtimeMs).toBe(before);
  });
});
