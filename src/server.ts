import app from './app';
import { env } from './config/env';
import { getMarketService } from './modules/market/market.service';

const PORT = parseInt(env.PORT, 10);
const HOST = '0.0.0.0'; // Listen on all network interfaces

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${env.NODE_ENV}`);
  console.log(`🌐 CORS Origin: ${env.CORS_ORIGIN}`);
  
  // Initialize market service after server starts
  const marketService = getMarketService();
  marketService.initialize(server);
});

// Graceful shutdown
const shutdown = () => {
  console.log('Shutdown signal received: closing HTTP server');
  
  // Shutdown market service
  const marketService = getMarketService();
  marketService.shutdown();
  
  // Close HTTP server
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

