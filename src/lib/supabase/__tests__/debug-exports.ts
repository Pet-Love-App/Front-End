import * as client from '../client';

console.log('Keys in client:', Object.keys(client));
console.log('Type of getSession:', typeof client.getSession);
console.log('Type of isSupabaseConfigured:', typeof client.isSupabaseConfigured);
