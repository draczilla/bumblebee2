const app = require('./app');
const { supabase } = require('./config/database');

const PORT = process.env.PORT || 3000;

// Test database connection on startup
async function startServer() {
  try {
    // Test database connection
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error && !error.message.includes('relation "users" does not exist')) {
      throw error;
    }
    console.log('Supabase connection successful');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`MLM Referral Tracker API running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();