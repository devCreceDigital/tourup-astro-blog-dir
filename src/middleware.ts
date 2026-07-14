import { validateSession } from './lib/auth';
import type { APIContext } from 'astro';

export async function onRequest(ctx: APIContext, next: () => Promise<Response>) {
  const { pathname } = new URL(ctx.request.url);
  const isAdminPage = pathname.startsWith('/admin/');
  const isAdminApi = pathname.startsWith('/api/admin/');
  const isLoginPage = /^\/admin\/[^/]+\/login\/?$/.test(pathname);
  const isApiAuth = pathname.startsWith('/api/admin/auth/');

  if ((isAdminPage && !isLoginPage) || (isAdminApi && !isApiAuth)) {
    const sessionCookie = ctx.cookies.get('session');
    const sessionId = sessionCookie?.value;

    if (!sessionId) {
      if (isAdminApi) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const lang = pathname.match(/\/admin\/([^/]+)/)?.[1] || 'es';
      return ctx.redirect(`/admin/${lang}/login`);
    }

    const session = await validateSession(sessionId);
    if (!session) {
      if (isAdminApi) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const lang = pathname.match(/\/admin\/([^/]+)/)?.[1] || 'es';
      return ctx.redirect(`/admin/${lang}/login`);
    }

    ctx.locals.session = session;
  }

  return next();
}
