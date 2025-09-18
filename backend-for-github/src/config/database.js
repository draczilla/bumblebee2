const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use environment variables with fallbacks for local development
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseUrl) {
  console.error('Error: SUPABASE_URL environment variable is required');
  console.error('Please set up your Supabase credentials in the .env file');
  process.exit(1);
}

if (!supabaseKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('Please set up your Supabase credentials in the .env file');
  process.exit(1);
}

// Create Supabase client for database operations
const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Helper function to execute raw SQL queries
async function query(text, params = []) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      query: text,
      params: params
    });
    
    if (error) throw error;
    return { rows: data };
  } catch (error) {
    // Fallback to direct table operations for simple queries
    throw error;
  }
}

module.exports = { query, supabase };