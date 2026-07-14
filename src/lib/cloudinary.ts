import { v2 as cloudinary } from 'cloudinary';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.warn(
    '[cloudinary] Missing one or more env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET. Media uploads will fail.'
  );
}

cloudinary.config({
  cloud_name: CLOUD_NAME || '',
  api_key: API_KEY || '',
  api_secret: API_SECRET || '',
});

const FOLDER = 'tourup';

export interface MediaFile {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  createdAt: string;
  originalFilename?: string;
}

export async function uploadMedia(
  filePath: string,
  options?: { publicId?: string; folder?: string }
): Promise<MediaFile> {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: options?.folder || FOLDER,
    public_id: options?.publicId,
    resource_type: 'auto',
  });
  return mapResult(result);
}

export async function uploadMediaBuffer(
  buffer: Buffer,
  filename: string
): Promise<MediaFile> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: FOLDER,
        resource_type: 'auto',
        public_id: filename.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_'),
      },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Upload failed'));
        resolve(mapResult(result));
      }
    );
    stream.end(buffer);
  });
}

export async function listMedia(folder?: string): Promise<MediaFile[]> {
  const result = await cloudinary.api.resources({
    type: 'upload',
    prefix: folder || FOLDER,
    max_results: 100,
  });
  return (result.resources || []).map(mapResult);
}

export async function deleteMedia(publicId: string): Promise<boolean> {
  const result = await cloudinary.uploader.destroy(publicId);
  return result.result === 'ok';
}

function mapResult(r: any): MediaFile {
  return {
    publicId: r.public_id,
    url: r.url,
    secureUrl: r.secure_url,
    format: r.format,
    width: r.width || 0,
    height: r.height || 0,
    bytes: r.bytes || 0,
    createdAt: r.created_at || '',
    originalFilename: r.original_filename,
  };
}
