import { createClient } from '@supabase/supabase-js';

const client = createClient('http://localhost', 'anon', {
  accessToken: async () => 'test_token',
});
console.log(client);
