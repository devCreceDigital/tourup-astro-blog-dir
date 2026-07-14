export const prerender = false;
import type { APIRoute } from 'astro';
import { deleteMedia } from '../../../../../lib/cloudinary';

export const DELETE: APIRoute = async ({ params }) => {
  const parts = (params.publicId as string).split('/');
  const decoded = decodeURIComponent(parts.join('/'));

  try {
    const ok = await deleteMedia(decoded);
    if (!ok) {
      return new Response(JSON.stringify({ error: 'Delete returned false' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ deleted: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Delete failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
