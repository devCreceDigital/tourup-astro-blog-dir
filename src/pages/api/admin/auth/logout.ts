export const prerender = false;
import type { APIRoute } from 'astro';
import { deleteSession } from '../../../../lib/auth';

export const POST: APIRoute = async (ctx) => {
  const sessionCookie = ctx.cookies.get('session');
  if (sessionCookie?.value) {
    await deleteSession(sessionCookie.value);
  }

  ctx.cookies.delete('session', { path: '/' });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
