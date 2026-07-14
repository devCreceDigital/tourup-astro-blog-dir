export const prerender = false;
import type { APIRoute } from 'astro';
import { validateSession, getUserById } from '../../../../lib/auth';

export const GET: APIRoute = async (ctx) => {
  const sessionCookie = ctx.cookies.get('session');
  if (!sessionCookie?.value) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const session = await validateSession(sessionCookie.value);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const user = await getUserById(session.userId);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ userId: user.id, username: user.username }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
