import { createClient } from '@supabase/supabase-js';

const supabaseUrl= 'https://oewelgbnnzgyamhpxyqs.supabase.co';
const supabaseAnonKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ld2VsZ2JubnpneWFtaHB4eXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkzMzQ0MDIsImV4cCI6MjAzNDkxMDQwMn0.wrKCzM1wbzyTLwBN7xbYu2mzS2GzQ6zAWHNe9Wv1BBo`;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;