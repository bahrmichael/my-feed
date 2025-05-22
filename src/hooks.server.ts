import { testConnection } from '$lib/db-neon';

// Initialize the database connection when the server starts
testConnection().then(success => {
  if (success) {
    console.log('Neon database initialized successfully');
  } else {
    console.error('Failed to initialize Neon database');
  }
});

// This is a SvelteKit hooks file with no actual hooks needed yet
// If you need to add hooks later, you can export them here