import { testConnection } from '$lib/db-neon';
import { error, type Handle } from '@sveltejs/kit';

// Initialize the database connection when the server starts
testConnection().then(success => {
  if (success) {
    console.log('Neon database initialized successfully');
  } else {
    console.error('Failed to initialize Neon database');
  }
});

export const handle: Handle = async ({ event, resolve }) => {
  // Check if it's an API route but not a cron route
  if (event.url.pathname.startsWith('/api/') && !event.url.pathname.startsWith('/api/cron/')) {
    // Get password from request
    const password = event.request.headers.get('X-Password');
    
    // Check if password matches environment variable
    if (!password || password !== process.env.PASSWORD) {
      throw error(401, 'Unauthorized');
    }
  }
  
  return resolve(event);
};