export const prerender = false;
import type { APIRoute } from 'astro';
import { listMedia, uploadMediaBuffer } from '../../../../../lib/cloudinary';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf',
]);

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return dot === -1 ? '' : filename.slice(dot).toLowerCase();
}

function validateFile(file: File): string | null {
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
    return `File type '${file.type}' is not allowed. Allowed: ${[...ALLOWED_MIME_TYPES].join(', ')}`;
  }
  if (!file.type && !ALLOWED_EXTENSIONS.has(getExtension(file.name))) {
    return `File extension '${getExtension(file.name)}' is not allowed.`;
  }
  return null;
}

function validateFilename(filename: string): string | null {
  if (!ALLOWED_EXTENSIONS.has(getExtension(filename))) {
    return `File extension '${getExtension(filename)}' is not allowed. Allowed: ${[...ALLOWED_EXTENSIONS].join(', ')}`;
  }
  return null;
}

export const GET: APIRoute = async () => {
  try {
    const files = await listMedia();
    return new Response(JSON.stringify({ data: files }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to list media' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const files = formData.getAll('files') as File[];
      const singleFile = formData.get('file') as File | null;

      const allFiles = files.length > 0 ? files : singleFile ? [singleFile] : [];
      if (allFiles.length === 0) {
        return new Response(JSON.stringify({ error: 'No files provided' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      for (const file of allFiles) {
        const err = validateFile(file);
        if (err) {
          return new Response(JSON.stringify({ error: err }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }

      const results = await Promise.all(
        allFiles.map(async (file) => {
          const buffer = Buffer.from(await file.arrayBuffer());
          return uploadMediaBuffer(buffer, file.name);
        })
      );

      return new Response(JSON.stringify({ data: results }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    if (!body.file || !body.filename) {
      return new Response(JSON.stringify({ error: 'file (base64) and filename required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const filenameErr = validateFilename(body.filename);
    if (filenameErr) {
      return new Response(JSON.stringify({ error: filenameErr }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const buffer = Buffer.from(body.file, 'base64');
    const result = await uploadMediaBuffer(buffer, body.filename);
    return new Response(JSON.stringify({ data: result }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Upload failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
