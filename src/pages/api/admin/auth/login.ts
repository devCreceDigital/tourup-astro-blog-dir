export const prerender = false;
import type { APIContext, APIRoute } from 'astro';
import { verifyPassword, createSession } from '../../../../lib/auth';
import { createRateLimiter } from '../../../../lib/rate-limit';

const MAX_ATTEMPTS = 5;
const MAX_ATTEMPTS_PER_USER = 10;
const WINDOW_MS = 15 * 60 * 1000;
// Límite práctico: scrypt sobre entradas enormes sería un vector de DoS.
const MAX_FIELD_LENGTH = 256;

const ipLimiter = createRateLimiter(MAX_ATTEMPTS, WINDOW_MS);
// Segundo límite por usuario: frena la fuerza bruta distribuida desde muchas IPs.
const userLimiter = createRateLimiter(MAX_ATTEMPTS_PER_USER, WINDOW_MS);

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

/**
 * IP del cliente. `x-forwarded-for` lo controla el cliente salvo que exista un proxy de confianza,
 * así que solo se usa con TRUST_PROXY=true (y entonces el ÚLTIMO valor, el que añade el proxy).
 */
function clientKey(ctx: APIContext): string {
  if (process.env.TRUST_PROXY === 'true') {
    const parts = (ctx.request.headers.get('x-forwarded-for') ?? '').split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  try {
    return ctx.clientAddress;
  } catch {
    return 'unknown';
  }
}

export const POST: APIRoute = async (ctx) => {
  const ip = clientKey(ctx);
  if (!ipLimiter.hit(ip)) {
    return json({ error: 'Too many attempts. Try again later.' }, 429);
  }

  let body: unknown;
  try {
    body = await ctx.request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }
  const { username, password } = (body ?? {}) as { username?: unknown; password?: unknown };

  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return json({ error: 'Username and password required' }, 400);
  }
  if (username.length > MAX_FIELD_LENGTH || password.length > MAX_FIELD_LENGTH) {
    return json({ error: 'Invalid credentials' }, 401);
  }

  const userKey = username.toLowerCase();
  if (!userLimiter.hit(userKey)) {
    return json({ error: 'Too many attempts. Try again later.' }, 429);
  }

  const user = await verifyPassword(username, password);
  if (!user) {
    return json({ error: 'Invalid credentials' }, 401);
  }

  ipLimiter.reset(ip);
  userLimiter.reset(userKey);

  const session = await createSession(user.id);

  ctx.cookies.set('session', session.id, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return json({ userId: user.id, username: user.username }, 200);
};
