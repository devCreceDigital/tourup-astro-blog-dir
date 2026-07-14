# Cloudinary Setup

## Required Environment Variables

Add these to your `.env` file (copy from `.env.example`):

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## How to get your credentials

1. Go to https://cloudinary.com/console
2. Log in or create a free account
3. Your **Cloud Name**, **API Key**, and **API Secret** are on the Dashboard page

## Where it's used

- `src/lib/cloudinary.ts` — SDK configuration for upload, list, and delete operations
- Cloudinary is the only media storage backend (no local fallback)

## Verification

After setting the env vars, the app will log a warning at startup if any are missing.
