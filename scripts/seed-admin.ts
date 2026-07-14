import { createUser } from '../src/lib/auth';

const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD || 'admin123';

try {
  const user = await createUser(username, password);
  console.log(`Admin user created: ${user.username} (${user.id})`);
} catch (err) {
  const error = err as Error & { code?: string };
  if (error.message?.includes('UNIQUE')) {
    console.log('Admin user already exists.');
  } else {
    throw err;
  }
}
